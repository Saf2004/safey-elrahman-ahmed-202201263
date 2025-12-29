from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple, List
from app.models.schemas import EnvironmentState

class RLEnvironment(ABC):
    @abstractmethod
    def reset(self) -> EnvironmentState:
        pass
    
    @abstractmethod
    def step(self, action: int) -> EnvironmentState:
        pass
    
    @abstractmethod
    def get_state_space(self) -> Dict[str, Any]:
        """Returns description of state space"""
        pass
    
    @abstractmethod
    def get_action_space(self) -> Dict[str, Any]:
        """Returns description of action space"""
        pass
    
    @abstractmethod
    def render(self) -> Dict[str, Any]:
        """Returns rendering data (not pixels, but state info for frontend)"""
        pass
    
    def is_model_based(self) -> bool:
        """Returns True if environment dynamics are known (for PI/VI)"""
        return False
    
    def get_transitions(self, state: Any, action: int) -> List[Tuple[float, Any, float, bool]]:
        """
        Returns list of (probability, next_state, reward, done) tuples.
        Only needed for model-based algorithms.
        """
        raise NotImplementedError("This environment does not support model-based algorithms")

