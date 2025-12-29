import gymnasium as gym
import numpy as np
from typing import Dict, Any, List, Tuple
from app.environments.base import RLEnvironment
from app.models.schemas import EnvironmentState

# Import Atari environments to register them
# This ensures the ALE namespace is available
try:
    import gymnasium.envs.atari
except ImportError:
    # Try importing ale_py directly
    try:
        import ale_py
    except ImportError:
        pass  # Atari environments may not be available

class Breakout(RLEnvironment):
    """
    Atari Breakout environment wrapper using Gymnasium.
    The agent controls a paddle to bounce a ball and break bricks.
    Uses RAM observations for discrete state representation.
    """
    
    def __init__(self, n_bins: int = 10):
        # Try RAM version first, then fall back to regular Breakout
        # Gymnasium doesn't have Breakout-ram, so we'll use regular Breakout
        # and try to access RAM through the ALE interface
        env_names_ram = [
            'ALE/Breakout-ram-v5',
            'ALE/Breakout-ram-v4', 
            'Breakout-ram-v5',
            'Breakout-ram-v4',
        ]
        
        env_names_regular = [
            'ALE/Breakout-v5',
            'ALE/Breakout-v4',
            'Breakout-v5',
            'Breakout-v4',
        ]
        
        self.env = None
        self.use_ram = False
        self.ale = None
        last_error = None
        
        # First try RAM versions
        for env_name in env_names_ram:
            try:
                self.env = gym.make(env_name)
                self.use_ram = True
                break
            except Exception as e:
                last_error = e
                continue
        
        # If RAM versions don't work, try regular Breakout
        if self.env is None:
            for env_name in env_names_regular:
                try:
                    self.env = gym.make(env_name)
                    # Try to get ALE interface to access RAM
                    try:
                        # Access the underlying ALE interface if available
                        if hasattr(self.env, 'ale'):
                            self.ale = self.env.ale
                            self.use_ram = True
                        elif hasattr(self.env, 'env') and hasattr(self.env.env, 'ale'):
                            self.ale = self.env.env.ale
                            self.use_ram = True
                    except:
                        self.use_ram = False
                    break
                except Exception as e:
                    last_error = e
                    continue
        
        if self.env is None:
            raise RuntimeError(
                f"Breakout environment not available. "
                f"Tried RAM versions: {', '.join(env_names_ram)}. "
                f"Tried regular versions: {', '.join(env_names_regular)}. "
                f"Please ensure the following are installed:\n"
                f"  - pip install 'gymnasium[atari]'\n"
                f"  - pip install 'gymnasium[accept-rom-license]'\n"
                f"  - pip install ale-py\n"
                f"Last error: {str(last_error)}"
            )
        
        self.n_bins = n_bins
        self.current_state = None
        self.current_obs = None
        self.steps = 0
        self.max_steps = 1000
        self.lives = 5
        self.last_ball_x = None
        self.last_ball_y = None
        self.ball_vel_x = 0
        self.ball_vel_y = 0
        self.last_score = 0
        self.bricks_destroyed = 0  # Track total bricks destroyed
        self.current_paddle_x = 80
        self.current_ball_x = 80
        self.current_ball_y = 100
        self.ball_x_ram_loc = 101
        self.ball_y_ram_loc = 72
        

        unwrapped_env = self.env
        while hasattr(unwrapped_env, 'env'):
            unwrapped_env = unwrapped_env.env
        
        actual_action_space = unwrapped_env.action_space.n if hasattr(unwrapped_env, 'action_space') else 6
        if actual_action_space == 6:
            self.action_map = {0: 0, 1: 1, 2: 2, 3: 4}
        elif actual_action_space == 4:
            # Direct mapping if action space matches
            self.action_map = {i: i for i in range(4)}
        else:
            # Fallback: try direct mapping
            self.action_map = {0: 0, 1: 1, 2: 2, 3: 3}
        
    def _get_ram(self) -> np.ndarray:
        """Get RAM observation from ALE interface if available"""
        if self.ale is not None:
            try:
                return self.ale.getRAM()
            except:
                pass
        return None
    
    def _discretize_ram(self, ram_obs: np.ndarray) -> int:
        """
        Convert 128-byte RAM to a simpler discrete state.
        Focus on key memory locations for paddle, ball position.
        """
        if ram_obs is None or len(ram_obs) == 0:
            # Fallback: use a hash of the observation or simplified state
            return 0
        
        paddle_x = ram_obs[99] if len(ram_obs) > 99 else 0
        ball_x = ram_obs[101] if len(ram_obs) > 101 else 0
        ball_y = ram_obs[72] if len(ram_obs) > 72 else 0
        
        # Discretize to bins
        paddle_bin = min(int(paddle_x / 256 * self.n_bins), self.n_bins - 1)
        ball_x_bin = min(int(ball_x / 256 * self.n_bins), self.n_bins - 1)
        ball_y_bin = min(int(ball_y / 256 * self.n_bins), self.n_bins - 1)
        
        # Combine into single discrete state
        discrete_state = paddle_bin * (self.n_bins ** 2) + ball_x_bin * self.n_bins + ball_y_bin
        return discrete_state
    
    def _discretize_from_image(self, image_obs: np.ndarray) -> int:
        """
        Fallback: Create a simplified discrete state from image observation.
        This is a simplified approach that extracts basic features.
        """
        if image_obs is None or len(image_obs.shape) < 2:
            return 0
        
        # Simple feature extraction: use downsampled image hash
        # This is a placeholder - in practice, you'd want better feature extraction
        if len(image_obs.shape) == 3:
            # RGB image - convert to grayscale and downsample
            gray = np.mean(image_obs, axis=2) if image_obs.shape[2] == 3 else image_obs[:, :, 0]
        else:
            gray = image_obs
        
        # Downsample to reduce state space
        h, w = gray.shape[:2]
        downsample_factor = max(1, min(h, w) // 10)
        downsampled = gray[::downsample_factor, ::downsample_factor]
        
        # Create a simple hash-based state
        state_hash = hash(downsampled.tobytes()) % (self.n_bins ** 3)
        return int(state_hash)
    
    def reset(self) -> EnvironmentState:
        obs, info = self.env.reset()
        self.current_obs = obs
        
        # Reset velocity tracking
        self.last_ball_x = None
        self.last_ball_y = None
        self.ball_vel_x = 0
        self.ball_vel_y = 0
        self.current_paddle_x = 80
        self.current_ball_x = 80
        self.current_ball_y = 100
        self.ball_x_ram_loc = 101
        self.ball_y_ram_loc = 72
        
        # Try to get RAM if available, otherwise use image observation
        if self.use_ram and self.ale is not None:
            ram_obs = self._get_ram()
            if ram_obs is not None:
                self.current_paddle_x = int(ram_obs[99]) if len(ram_obs) > 99 else 80
                self.current_ball_x = int(ram_obs[101]) if len(ram_obs) > 101 else 80
                self.current_ball_y = int(ram_obs[72]) if len(ram_obs) > 72 else 100
            self.current_state = self._discretize_ram(ram_obs) if ram_obs is not None else self._discretize_from_image(obs)
        elif self.use_ram:
            # Direct RAM observation
            if isinstance(obs, np.ndarray) and len(obs.shape) == 1:
                self.current_paddle_x = int(obs[99]) if len(obs) > 99 else 80
                self.current_ball_x = int(obs[101]) if len(obs) > 101 else 80
                self.current_ball_y = int(obs[72]) if len(obs) > 72 else 100
            self.current_state = self._discretize_ram(obs)
        else:
            # Image observation - use simplified discretization
            self.current_state = self._discretize_from_image(obs)
        
        self.steps = 0
        self.lives = info.get('lives', 5)
        self.last_score = 0
        self.bricks_destroyed = 0
        
        info_dict = {
            "lives": self.lives,
            "score": 0,
            "bricks_destroyed": 0,
            **info
        }
        
        if self.use_ram and isinstance(obs, np.ndarray) and len(obs.shape) == 1:
            info_dict["ram_obs"] = obs.tolist()[:10] if len(obs) > 10 else obs.tolist()
        
        return EnvironmentState(
            observation=self.current_state,
            reward=0.0,
            done=False,
            info=info_dict
        )
    
    def step(self, action: int) -> EnvironmentState:
        self.steps += 1
        # Map our action space (0-3) to Gymnasium's action space
        gym_action = self.action_map.get(action, action)
        obs, reward, terminated, truncated, info = self.env.step(gym_action)
        done = terminated or truncated or self.steps >= self.max_steps
        
        self.current_obs = obs
        
        # Try to get RAM if available, otherwise use image observation
        if self.use_ram and self.ale is not None:
            ram_obs = self._get_ram()
            self.current_state = self._discretize_ram(ram_obs) if ram_obs is not None else self._discretize_from_image(obs)
        elif self.use_ram:
            # Direct RAM observation
            self.current_state = self._discretize_ram(obs)
        else:
            # Image observation - use simplified discretization
            self.current_state = self._discretize_from_image(obs)
        
        self.lives = info.get('lives', self.lives)
        
        # Track score and bricks destroyed
        current_score = info.get('score', info.get('episode', {}).get('r', 0))
        score_change = current_score - self.last_score if self.last_score is not None else 0
        
        if reward > 0:
            # Reward directly indicates brick hit
            self.bricks_destroyed += max(1, int(reward))
        elif score_change > 0:
            # Also check score change as backup
            self.bricks_destroyed += max(1, int(score_change))
        
        self.last_score = current_score if current_score > 0 else self.last_score
        
        info_dict = {
            "lives": self.lives,
            "score": self.steps,
            "bricks_destroyed": self.bricks_destroyed,
            **info
        }
        
        # Add RAM-based info if available
        if self.use_ram and self.ale is not None:
            ram_obs = self._get_ram()
            if ram_obs is not None:
                info_dict["ram_obs"] = ram_obs.tolist()[:10] if len(ram_obs) > 10 else ram_obs.tolist()
                self.current_paddle_x = int(ram_obs[99]) if len(ram_obs) > 99 else 80
                
                # Try primary RAM locations for ball position
                ball_x_candidate = int(ram_obs[self.ball_x_ram_loc]) if len(ram_obs) > self.ball_x_ram_loc else 0
                ball_y_candidate = int(ram_obs[self.ball_y_ram_loc]) if len(ram_obs) > self.ball_y_ram_loc else 0
                
                # If ball position seems invalid (0 or out of range), try alternative locations
                if ball_x_candidate == 0 and ball_y_candidate == 0 and self.steps > 10:
                    # Try alternative RAM locations for ball position
                    for x_loc in [100, 102, 103]:
                        for y_loc in [73, 74, 75]:
                            if len(ram_obs) > max(x_loc, y_loc):
                                test_x = int(ram_obs[x_loc])
                                test_y = int(ram_obs[y_loc])
                                # Check if values are in reasonable range for Breakout (0-200)
                                if 0 < test_x < 200 and 0 < test_y < 250:
                                    self.ball_x_ram_loc = x_loc
                                    self.ball_y_ram_loc = y_loc
                                    ball_x_candidate = test_x
                                    ball_y_candidate = test_y
                                    break
                        if ball_x_candidate != 0:
                            break
                
                # Always update ball position from RAM (even if 0, which might mean inactive)
                if 0 <= ball_x_candidate < 256:
                    self.current_ball_x = ball_x_candidate
                if 0 <= ball_y_candidate < 256:
                    self.current_ball_y = ball_y_candidate
                    
                info_dict["paddle_x"] = self.current_paddle_x
                info_dict["ball_x"] = self.current_ball_x
                info_dict["ball_y"] = self.current_ball_y
        elif self.use_ram and isinstance(obs, np.ndarray) and len(obs.shape) == 1:
            info_dict["ram_obs"] = obs.tolist()[:10] if len(obs) > 10 else obs.tolist()
            self.current_paddle_x = int(obs[99]) if len(obs) > 99 else 80
            
            ball_x_candidate = int(obs[self.ball_x_ram_loc]) if len(obs) > self.ball_x_ram_loc else 0
            ball_y_candidate = int(obs[self.ball_y_ram_loc]) if len(obs) > self.ball_y_ram_loc else 0
            
            if 0 <= ball_x_candidate < 256:
                self.current_ball_x = ball_x_candidate
            if 0 <= ball_y_candidate < 256:
                self.current_ball_y = ball_y_candidate
                
            info_dict["paddle_x"] = self.current_paddle_x
            info_dict["ball_x"] = self.current_ball_x
            info_dict["ball_y"] = self.current_ball_y
        
        # Calculate ball velocity from position changes
        if self.last_ball_x is not None and self.last_ball_y is not None:
            self.ball_vel_x = self.current_ball_x - self.last_ball_x
            self.ball_vel_y = self.current_ball_y - self.last_ball_y
        else:
            self.ball_vel_x = 0
            self.ball_vel_y = 0
        
        self.last_ball_x = self.current_ball_x
        self.last_ball_y = self.current_ball_y
        
        return EnvironmentState(
            observation=self.current_state,
            reward=float(reward),
            done=done,
            info=info_dict
        )
    
    def get_state_space(self) -> Dict[str, Any]:
        return {
            "type": "discrete",
            "n": self.n_bins ** 3,  # paddle_x * ball_x * ball_y bins
            "description": "Discretized (Paddle X, Ball X, Ball Y)"
        }
    
    def get_action_space(self) -> Dict[str, Any]:
        return {
            "type": "discrete",
            "n": 4,
            "actions": ["NOOP", "FIRE", "RIGHT", "LEFT"]
        }
    
    def render(self) -> Dict[str, Any]:
        if self.current_obs is None:
            return {
                "paddle_x": 80, 
                "ball_x": 80, 
                "ball_y": 100, 
                "ball_vel_x": 0,
                "ball_vel_y": 0,
                "lives": 5,
                "score": 0
            }
        
        # Use the stored positions from the last step() call
        # This ensures we're using the same values that were extracted during step()
        paddle_x = self.current_paddle_x
        ball_x = self.current_ball_x
        ball_y = self.current_ball_y
        
        # Calculate remaining bricks (40 total bricks in Breakout)
        total_bricks = 40
        remaining_bricks = max(0, total_bricks - self.bricks_destroyed)
        
        return {
            "paddle_x": paddle_x,
            "ball_x": ball_x,
            "ball_y": ball_y,
            "ball_vel_x": self.ball_vel_x,
            "ball_vel_y": self.ball_vel_y,
            "lives": self.lives,
            "score": self.steps,
            "bricks_destroyed": self.bricks_destroyed,
            "remaining_bricks": remaining_bricks
        }
    
    def is_model_based(self) -> bool:
        return False  # Atari games are not model-based
    
    def close(self):
        self.env.close()
