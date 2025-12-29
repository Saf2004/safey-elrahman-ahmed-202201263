import numpy as np
from typing import Dict, Any, List, Tuple
from app.environments.base import RLEnvironment
from app.models.schemas import EnvironmentState

try:
    from gym4real.envs import DamEnv as Gym4RealDamEnv
    GYM4REAL_AVAILABLE = True
except ImportError:
    GYM4REAL_AVAILABLE = False

class Gym4RealDam(RLEnvironment):
    """
    Gym4ReaL Dam Environment - Water/Energy Management.
    
    The agent manages a dam by controlling water release to balance:
    - Flood prevention (don't let water level get too high)
    - Power generation (release water through turbines)
    - Environmental flow requirements (maintain minimum downstream flow)
    
    This is a realistic environment with partial observability and non-stationarity.
    """
    
    def __init__(self, n_bins: int = 20):
        self.n_bins = n_bins
        self.use_real_env = GYM4REAL_AVAILABLE
        
        if self.use_real_env:
            try:
                self.env = Gym4RealDamEnv()
            except Exception:
                self.use_real_env = False
        
        # Fallback: Simple dam simulation
        self.water_level = 50.0  # Current water level (0-100)
        self.inflow_rate = 5.0   # Water coming in
        self.max_level = 100.0
        self.min_level = 10.0
        self.target_level = 50.0
        
        self.current_state = None
        self.steps = 0
        self.max_steps = 200
        self.total_power = 0.0
        
    def _discretize_state(self, water_level: float, inflow: float) -> int:
        """Convert continuous state to discrete"""
        level_bin = min(int((water_level / self.max_level) * self.n_bins), self.n_bins - 1)
        inflow_bin = min(int((inflow / 20.0) * self.n_bins), self.n_bins - 1)
        return level_bin * self.n_bins + inflow_bin
    
    def reset(self) -> EnvironmentState:
        self.steps = 0
        self.total_power = 0.0
        
        if self.use_real_env:
            try:
                obs, info = self.env.reset()
                self.current_state = self._process_gym4real_obs(obs)
                return EnvironmentState(
                    observation=self.current_state,
                    reward=0.0,
                    done=False,
                    info=info
                )
            except Exception:
                self.use_real_env = False
        
        # Fallback simulation
        self.water_level = 50.0 + np.random.uniform(-10, 10)
        self.inflow_rate = 5.0 + np.random.uniform(-2, 2)
        self.current_state = self._discretize_state(self.water_level, self.inflow_rate)
        
        return EnvironmentState(
            observation=self.current_state,
            reward=0.0,
            done=False,
            info={
                "water_level": self.water_level,
                "inflow_rate": self.inflow_rate,
                "power_generated": 0.0
            }
        )
    
    def _process_gym4real_obs(self, obs) -> int:
        """Process Gym4ReaL observation to discrete state"""
        if hasattr(obs, '__len__') and len(obs) > 0:
            # Discretize first observation component
            val = float(obs[0]) if hasattr(obs, '__getitem__') else float(obs)
            return min(int((val + 1) / 2 * (self.n_bins ** 2)), (self.n_bins ** 2) - 1)
        return 0
    
    def step(self, action: int) -> EnvironmentState:
        self.steps += 1
        
        if self.use_real_env:
            try:
                obs, reward, terminated, truncated, info = self.env.step(action)
                done = terminated or truncated or self.steps >= self.max_steps
                self.current_state = self._process_gym4real_obs(obs)
                
                return EnvironmentState(
                    observation=self.current_state,
                    reward=float(reward),
                    done=done,
                    info=info
                )
            except Exception:
                self.use_real_env = False
        
        # Fallback simulation
        # Actions: 0=Low release, 1=Medium release, 2=High release
        release_rates = [2.0, 5.0, 10.0]
        release = release_rates[min(action, 2)]
        
        # Update water level
        self.inflow_rate = max(0, self.inflow_rate + np.random.uniform(-1, 1))
        self.water_level += self.inflow_rate - release
        self.water_level = np.clip(self.water_level, 0, self.max_level)
        
        # Calculate reward
        power_generated = release * 0.5  # Power proportional to release
        self.total_power += power_generated
        
        # Penalties for extreme levels
        level_penalty = 0
        if self.water_level > 90:
            level_penalty = -10 * (self.water_level - 90) / 10  # Flood risk
        elif self.water_level < 20:
            level_penalty = -5 * (20 - self.water_level) / 20   # Too low
        
        reward = power_generated + level_penalty
        
        # Check termination
        done = False
        if self.water_level >= self.max_level:
            done = True
            reward = -50  # Dam overflow
        elif self.water_level <= 0:
            done = True
            reward = -20  # Dam empty
        elif self.steps >= self.max_steps:
            done = True
            reward += self.total_power * 0.1  # Bonus for total power
        
        self.current_state = self._discretize_state(self.water_level, self.inflow_rate)
        
        return EnvironmentState(
            observation=self.current_state,
            reward=float(reward),
            done=done,
            info={
                "water_level": self.water_level,
                "inflow_rate": self.inflow_rate,
                "power_generated": power_generated,
                "total_power": self.total_power,
                "release": release
            }
        )
    
    def get_state_space(self) -> Dict[str, Any]:
        return {
            "type": "discrete",
            "n": self.n_bins ** 2,
            "description": "Discretized (Water Level, Inflow Rate)"
        }
    
    def get_action_space(self) -> Dict[str, Any]:
        return {
            "type": "discrete",
            "n": 3,
            "actions": ["LOW_RELEASE", "MEDIUM_RELEASE", "HIGH_RELEASE"]
        }
    
    def render(self) -> Dict[str, Any]:
        return {
            "water_level": self.water_level,
            "max_level": self.max_level,
            "inflow_rate": self.inflow_rate,
            "total_power": self.total_power,
            "target_level": self.target_level
        }
    
    def is_model_based(self) -> bool:
        return False  # Complex dynamics
    
    def close(self):
        if self.use_real_env and hasattr(self, 'env'):
            self.env.close()
