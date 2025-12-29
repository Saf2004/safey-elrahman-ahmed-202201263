import numpy as np
from typing import Dict, Any, Tuple
from app.environments.base import RLEnvironment
from app.models.schemas import EnvironmentState

class GridWorld(RLEnvironment):
    def __init__(self, size: int = 4):
        self.size = size
        self.shape = (size, size)
        self.start_state = (0, 0)
        self.goal_state = (size - 1, size - 1)
        self.holes = [(1, 1), (1, 3), (2, 3), (3, 0)] if size == 4 else [] # Simple preset
        self.current_state = self.start_state
        self.max_steps = 100
        self.steps = 0
        
        # Actions: 0: UP, 1: RIGHT, 2: DOWN, 3: LEFT
        self.action_space_size = 4
        self.moves = [(-1, 0), (0, 1), (1, 0), (0, -1)]

    def reset(self) -> EnvironmentState:
        self.current_state = self.start_state
        self.steps = 0
        return EnvironmentState(
            observation=self._state_to_index(self.current_state),
            reward=0.0,
            done=False,
            info={"state_coords": self.current_state}
        )

    def step(self, action: int) -> EnvironmentState:
        self.steps += 1
        row, col = self.current_state
        dr, dc = self.moves[action]
        
        new_row = max(0, min(self.size - 1, row + dr))
        new_col = max(0, min(self.size - 1, col + dc))
        new_state = (new_row, new_col)
        
        reward = -0.01
        done = False
        
        if new_state == self.goal_state:
            reward = 1.0
            done = True
        elif new_state in self.holes:
            reward = -1.0
            done = True
        elif self.steps >= self.max_steps:
            done = True
            
        self.current_state = new_state
        
        return EnvironmentState(
            observation=self._state_to_index(self.current_state),
            reward=reward,
            done=done,
            info={"state_coords": self.current_state}
        )

    def get_state_space(self) -> Dict[str, Any]:
        return {
            "type": "discrete",
            "n": self.size * self.size,
            "shape": self.shape
        }

    def get_action_space(self) -> Dict[str, Any]:
        return {
            "type": "discrete",
            "n": 4,
            "actions": ["UP", "RIGHT", "DOWN", "LEFT"]
        }

    def render(self) -> Dict[str, Any]:
        return {
            "grid_size": self.size,
            "agent_position": self.current_state,
            "goal_position": self.goal_state,
            "holes": self.holes
        }
        
    def _state_to_index(self, state: Tuple[int, int]) -> int:
        return state[0] * self.size + state[1]
    
    def _index_to_state(self, index: int) -> Tuple[int, int]:
        return (index // self.size, index % self.size)
    
    def is_model_based(self) -> bool:
        return True
    
    def get_transitions(self, state: int, action: int) -> list:
        """Returns [(probability, next_state, reward, done)]"""
        state_coords = self._index_to_state(state)
        row, col = state_coords
        dr, dc = self.moves[action]
        
        new_row = max(0, min(self.size - 1, row + dr))
        new_col = max(0, min(self.size - 1, col + dc))
        new_state = (new_row, new_col)
        new_state_idx = self._state_to_index(new_state)
        
        reward = -0.01
        done = False
        
        if new_state == self.goal_state:
            reward = 1.0
            done = True
        elif new_state in self.holes:
            reward = -1.0
            done = True
        
        # Deterministic transitions
        return [(1.0, new_state_idx, reward, done)]

