from abc import ABC, abstractmethod
from typing import Generator, Dict, Any, Union
from app.models.schemas import TrainingConfig, TrainingUpdate

class RLAlgorithm(ABC):
    @abstractmethod
    def train(self, env, config: TrainingConfig) -> Generator[TrainingUpdate, None, None]:
        pass
    
    @abstractmethod
    def get_value_function(self) -> Dict[str, float]:
        pass
    
    @abstractmethod
    def get_policy(self) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    def select_action(self, state: Union[int, tuple]) -> int:
        pass
