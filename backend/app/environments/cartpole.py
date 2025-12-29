import gymnasium as gym
import numpy as np
from typing import Dict, Any, List, Tuple
from app.environments.base import RLEnvironment
from app.models.schemas import EnvironmentState

class CartPole(RLEnvironment):
    """CartPole-v1 wrapper using Gymnasium with state discretization for Q-learning"""
    
    def __init__(self, n_bins: int = 10):
        self.env = gym.make('CartPole-v1')
        self.n_bins = n_bins
        
        self.bins = [
            np.linspace(-2.4, 2.4, n_bins),      # Cart position
            np.linspace(-3.0, 3.0, n_bins),      # Cart velocity
            np.linspace(-0.25, 0.25, n_bins),    # Pole angle (radians)
            np.linspace(-3.0, 3.0, n_bins),      # Pole angular velocity
        ]
        
        self.current_state = None
        self.current_discrete_state = None
        self.steps = 0
        self.max_steps = 500
    
    def _discretize_state(self, state: np.ndarray) -> int:
        """Convert continuous 4D state to single discrete index"""
        discrete_indices = []
        for i, val in enumerate(state):
            idx = np.digitize(val, self.bins[i])
            idx = min(idx, self.n_bins)  # Clip to valid range
            discrete_indices.append(idx)
        
        # Combine into single discrete state
        n = self.n_bins + 1
        discrete_state = (discrete_indices[0] * (n ** 3) + 
                         discrete_indices[1] * (n ** 2) + 
                         discrete_indices[2] * n + 
                         discrete_indices[3])
        return int(discrete_state)
    
    def reset(self) -> EnvironmentState:
        obs, info = self.env.reset()
        self.current_state = obs
        self.current_discrete_state = self._discretize_state(obs)
        self.steps = 0
        return EnvironmentState(
            observation=self.current_discrete_state,
            reward=0.0,
            done=False,
            info={
                "continuous_state": obs.tolist(),
                **info
            }
        )
    
    def step(self, action: int) -> EnvironmentState:
        self.steps += 1
        obs, reward, terminated, truncated, info = self.env.step(action)
        done = terminated or truncated
        
        self.current_state = obs
        self.current_discrete_state = self._discretize_state(obs)
        
        return EnvironmentState(
            observation=self.current_discrete_state,
            reward=float(reward),
            done=done,
            info={
                "continuous_state": obs.tolist(),
                "cart_position": float(obs[0]),
                "pole_angle": float(obs[2]),
                **info
            }
        )
    
    def get_state_space(self) -> Dict[str, Any]:
        n = self.n_bins + 1
        return {
            "type": "discrete",
            "n": n ** 4,  # 4 dimensions discretized
            "description": "Discretized (Cart Position, Cart Velocity, Pole Angle, Pole Angular Velocity)"
        }
    
    def get_action_space(self) -> Dict[str, Any]:
        return {
            "type": "discrete",
            "n": 2,
            "actions": ["LEFT", "RIGHT"]
        }
    
    def render(self) -> Dict[str, Any]:
        if self.current_state is None:
            return {"cart_position": 0, "pole_angle": 0}
        
        return {
            "cart_position": float(self.current_state[0]),
            "cart_velocity": float(self.current_state[1]),
            "pole_angle": float(self.current_state[2]),
            "pole_velocity": float(self.current_state[3])
        }
    
    def is_model_based(self) -> bool:
        return False  # Physics-based, continuous state
    
    def close(self):
        self.env.close()
