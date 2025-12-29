import numpy as np
from typing import Dict, Any, Tuple, List
from app.environments.base import RLEnvironment
from app.models.schemas import EnvironmentState

class FrozenLake(RLEnvironment):
    """
    FrozenLake environment - Navigate on slippery ice to reach goal
    S: Start, F: Frozen (safe), H: Hole (terminal), G: Goal (terminal)
    """
    
    def __init__(self, size: int = 5, is_slippery: bool = True):
        self.size = size
        self.is_slippery = is_slippery
        
        # 5x5 map (default) - matches the pixel art layout
        if size == 5:
            self.desc = [
                "SFFFF",
                "FHFFF",
                "FFHFF",
                "FHHFF",
                "FFFFG"
            ]
        elif size == 4:
            self.desc = [
                "SFFF",
                "FHFH",
                "FFFH",
                "HFFG"
            ]
        else:  # 8x8 map
            self.desc = [
                "SFFFFFFF",
                "FFFFFFFF",
                "FFFHFFFF",
                "FFFFFHFF",
                "FFFHFFFF",
                "FHHFFFHF",
                "FHFFHFHF",
                "FFFHFFFG"
            ]
        
        self.n_states = size * size
        self.n_actions = 4  # LEFT, DOWN, RIGHT, UP
        self.actions = [0, 1, 2, 3]
        self.action_names = ["LEFT", "DOWN", "RIGHT", "UP"]
        
        # Parse map
        self.start_state = None
        self.goal_state = None
        self.holes = []
        
        for i in range(size):
            for j in range(size):
                idx = i * size + j
                cell = self.desc[i][j]
                if cell == 'S':
                    self.start_state = idx
                elif cell == 'G':
                    self.goal_state = idx
                elif cell == 'H':
                    self.holes.append(idx)
        
        self.current_state = self.start_state
        self.steps = 0
        self.max_steps = 100
    
    def reset(self) -> EnvironmentState:
        self.current_state = self.start_state
        self.steps = 0
        return EnvironmentState(
            observation=self.current_state,
            reward=0.0,
            done=False,
            info={"state_coords": self._index_to_coords(self.current_state)}
        )
    
    def step(self, action: int) -> EnvironmentState:
        self.steps += 1
        
        # Get transitions and sample one
        transitions = self.get_transitions(self.current_state, action)
        probs = [t[0] for t in transitions]
        idx = np.random.choice(len(transitions), p=probs)
        prob, next_state, reward, done = transitions[idx]
        
        self.current_state = next_state
        
        if self.steps >= self.max_steps:
            done = True
        
        return EnvironmentState(
            observation=self.current_state,
            reward=reward,
            done=done,
            info={"state_coords": self._index_to_coords(self.current_state)}
        )
    
    def get_state_space(self) -> Dict[str, Any]:
        return {
            "type": "discrete",
            "n": self.n_states,
            "shape": (self.size, self.size)
        }
    
    def get_action_space(self) -> Dict[str, Any]:
        return {
            "type": "discrete",
            "n": 4,
            "actions": self.action_names
        }
    
    def render(self) -> Dict[str, Any]:
        coords = self._index_to_coords(self.current_state)
        return {
            "grid_size": self.size,
            "agent_position": coords,
            "goal_position": self._index_to_coords(self.goal_state),
            "holes": [self._index_to_coords(h) for h in self.holes],
            "start_position": self._index_to_coords(self.start_state),
            "desc": self.desc
        }
    
    def is_model_based(self) -> bool:
        return True
    
    def get_transitions(self, state: int, action: int) -> List[Tuple[float, int, float, bool]]:
        """
        Returns [(probability, next_state, reward, done)]
        If slippery, agent moves in intended direction with prob 1/3,
        and perpendicular directions with prob 1/3 each.
        """
        if state in self.holes or state == self.goal_state:
            # Terminal states
            return [(1.0, state, 0.0, True)]
        
        transitions = []
        
        if self.is_slippery:
            # Agent might slip
            # Intended direction: 1/3, perpendicular directions: 1/3 each
            intended_actions = [action]
            perpendicular_actions = [(action - 1) % 4, (action + 1) % 4]
            
            all_actions = intended_actions + perpendicular_actions
            prob_per_action = 1.0 / 3.0
            
            for a in all_actions:
                next_state = self._get_next_state(state, a)
                reward, done = self._get_reward_done(next_state)
                transitions.append((prob_per_action, next_state, reward, done))
        else:
            # Deterministic
            next_state = self._get_next_state(state, action)
            reward, done = self._get_reward_done(next_state)
            transitions.append((1.0, next_state, reward, done))
        
        return transitions
    
    def _get_next_state(self, state: int, action: int) -> int:
        """Calculate next state from action (respecting boundaries)"""
        row, col = self._index_to_coords(state)
        
        # LEFT, DOWN, RIGHT, UP
        if action == 0:  # LEFT
            col = max(0, col - 1)
        elif action == 1:  # DOWN
            row = min(self.size - 1, row + 1)
        elif action == 2:  # RIGHT
            col = min(self.size - 1, col + 1)
        elif action == 3:  # UP
            row = max(0, row - 1)
        
        return self._coords_to_index(row, col)
    
    def _get_reward_done(self, state: int) -> Tuple[float, bool]:
        """Get reward and done flag for a state"""
        if state == self.goal_state:
            return 1.0, True
        elif state in self.holes:
            return 0.0, True
        else:
            return 0.0, False
    
    def _index_to_coords(self, index: int) -> Tuple[int, int]:
        return (index // self.size, index % self.size)
    
    def _coords_to_index(self, row: int, col: int) -> int:
        return row * self.size + col
