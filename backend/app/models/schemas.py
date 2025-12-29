from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Union, Optional, Any
from .enums import EnvironmentType, AlgorithmType

# --- Training Configuration ---
class TrainingConfig(BaseModel):
    environment: EnvironmentType
    algorithm: AlgorithmType
    discount_factor: float = Field(default=0.99, ge=0.0, le=1.0)
    learning_rate: float = Field(default=0.1, ge=0.0, le=1.0)
    epsilon: float = Field(default=0.1, ge=0.0, le=1.0)
    n_episodes: int = Field(default=1000, gt=0)
    max_steps: int = Field(default=500, gt=0)
    n_step: int = Field(default=1, gt=0)  # for n-step TD
    step_delay_ms: int = Field(default=200, ge=1, le=1000)  # visualization speed

# --- Data Transfer Objects ---
class EnvironmentState(BaseModel):
    observation: Union[List[float], Dict[str, Any], int, List[int]]
    reward: float
    done: bool
    info: Dict[str, Any]

class TrainingUpdate(BaseModel):
    episode: int
    step: int
    reward: float
    cumulative_reward: float
    state: Union[List[float], Dict[str, Any], int, List[int]]
    action: int
    value_function: Optional[Dict[str, float]] = None
    policy: Optional[Dict[str, Any]] = None

class TrainingMetrics(BaseModel):
    episode_rewards: List[float]
    episode_lengths: List[int]

class InferenceConfig(BaseModel):
    environment: EnvironmentType
    algorithm: AlgorithmType
    max_steps: int = 500
    render_delay: float = 0.1

# --- Environment Info ---
class SpaceInfo(BaseModel):
    type: str  # "discrete", "continuous", "box"
    shape: Optional[List[int]] = None
    low: Optional[List[float]] = None
    high: Optional[List[float]] = None
    n: Optional[int] = None  # for discrete spaces

class Environment(BaseModel):
    id: str
    name: str
    description: str
    state_space: SpaceInfo
    action_space: SpaceInfo
    max_episode_steps: int

# --- Algorithm Info ---
class Algorithm(BaseModel):
    id: str
    name: str
    description: str
    requires_model: bool  # True for PI/VI, False for TD methods
    compatible_environments: List[str]
    parameters: Dict[str, Any]

# --- Training Status ---
class TrainingStatus(BaseModel):
    session_id: str
    is_running: bool
    current_episode: int
    total_episodes: int
    elapsed_time: float
    config: TrainingConfig

# --- Inference Result ---
class InferenceResult(BaseModel):
    states: List[Any]
    actions: List[int]
    rewards: List[float]
    total_reward: float
    episode_length: int

# --- Rendering Data ---
class RenderData(BaseModel):
    type: str  # "grid", "canvas", "plot"
    data: Dict[str, Any]

