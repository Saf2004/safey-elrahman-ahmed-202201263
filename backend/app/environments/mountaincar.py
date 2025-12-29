import gymnasium as gym
import numpy as np
from typing import Dict, Any, List, Tuple
from app.environments.base import RLEnvironment
from app.models.schemas import EnvironmentState

class MountainCar(RLEnvironment):
    """MountainCar-v0 wrapper using Gymnasium with discretization"""
    
    def __init__(self, n_bins: int = 20):
        self.env = gym.make('MountainCar-v0')
        self.n_bins = n_bins
        
        # Discretization bins
        self.position_bins = np.linspace(-1.2, 0.6, n_bins)
        self.velocity_bins = np.linspace(-0.07, 0.07, n_bins)
        
        self.current_state = None
        self.current_discrete_state = None
        self.steps = 0
        self.max_steps = 200
    
    def _discretize_state(self, state):
        """Convert continuous state to discrete"""
        position, velocity = state
        pos_idx = np.digitize(position, self.position_bins)
        vel_idx = np.digitize(velocity, self.velocity_bins)
        
        # Combine into single discrete state
        discrete = pos_idx * (self.n_bins + 1) + vel_idx
        return discrete
    
    def reset(self) -> EnvironmentState:
        obs, info = self.env.reset()
        self.current_state = obs
        self.current_discrete_state = self._discretize_state(obs)
        self.steps = 0
        
        return EnvironmentState(
            observation=self.current_discrete_state,
            reward=0.0,
            done=False,
            info={"continuous_state": obs.tolist(), **info}
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
            info={"continuous_state": obs.tolist(), **info}
        )
    
    def get_state_space(self) -> Dict[str, Any]:
        return {
            "type": "discrete",
            "n": (self.n_bins + 1) ** 2,
            "description": "Discretized (Position, Velocity)",
            "continuous_low": [-1.2, -0.07],
            "continuous_high": [0.6, 0.07]
        }
    
    def get_action_space(self) -> Dict[str, Any]:
        return {
            "type": "discrete",
            "n": 3,
            "actions": ["LEFT", "STAY", "RIGHT"]
        }
    
    def render(self) -> Dict[str, Any]:
        if self.current_state is None:
            return {"position": -0.5, "velocity": 0}
        
        return {
            "position": float(self.current_state[0]),
            "velocity": float(self.current_state[1]),
            "goal_position": 0.5
        }
    
    def is_model_based(self) -> bool:
        return False  # Physics simulation
    
    def close(self):
        self.env.close()
