from app.environments.gridworld import GridWorld
from app.environments.frozenlake import FrozenLake
from app.environments.cartpole import CartPole
from app.environments.mountaincar import MountainCar
from app.environments.breakout import Breakout
from app.environments.gym4real_dam import Gym4RealDam
from app.environments.base import RLEnvironment
from app.models.enums import EnvironmentType

def create_environment(env_type: EnvironmentType) -> RLEnvironment:
    """Factory function to create environments"""
    if env_type == EnvironmentType.GRIDWORLD:
        return GridWorld(size=5)
    elif env_type == EnvironmentType.FROZENLAKE:
        return FrozenLake(size=5, is_slippery=True)
    elif env_type == EnvironmentType.CARTPOLE:
        return CartPole(n_bins=10)
    elif env_type == EnvironmentType.MOUNTAINCAR:
        return MountainCar(n_bins=20)
    elif env_type == EnvironmentType.BREAKOUT:
        return Breakout(n_bins=10)
    elif env_type == EnvironmentType.GYM4REAL_DAM:
        return Gym4RealDam(n_bins=20)
    else:
        raise ValueError(f"Unknown environment type: {env_type}")

