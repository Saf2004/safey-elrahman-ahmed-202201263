from fastapi import APIRouter
from app.models.enums import EnvironmentType
from app.models.schemas import Environment, SpaceInfo

router = APIRouter()

ENVIRONMENT_INFO = {
    EnvironmentType.GRIDWORLD: Environment(
        id="gridworld",
        name="GridWorld",
        description="Navigate a grid to reach the goal while avoiding holes",
        state_space=SpaceInfo(type="discrete", n=25, shape=[5, 5]),
        action_space=SpaceInfo(type="discrete", n=4),
        max_episode_steps=100
    ),
    EnvironmentType.FROZENLAKE: Environment(
        id="frozenlake",
        name="FrozenLake",
        description="Navigate on slippery ice to reach the goal without falling into holes",
        state_space=SpaceInfo(type="discrete", n=25, shape=[5, 5]),
        action_space=SpaceInfo(type="discrete", n=4),
        max_episode_steps=100
    ),
    EnvironmentType.CARTPOLE: Environment(
        id="cartpole",
        name="CartPole",
        description="Balance a pole on a moving cart",
        state_space=SpaceInfo(type="discrete", n=14641),  # 11^4 discretized states
        action_space=SpaceInfo(type="discrete", n=2),
        max_episode_steps=500
    ),
    EnvironmentType.MOUNTAINCAR: Environment(
        id="mountaincar",
        name="MountainCar",
        description="Drive an underpowered car up a steep hill",
        state_space=SpaceInfo(type="discrete", n=441),  # 20x20 discretization
        action_space=SpaceInfo(type="discrete", n=3),
        max_episode_steps=200
    ),
    EnvironmentType.BREAKOUT: Environment(
        id="breakout",
        name="Breakout",
        description="Classic Atari game - control a paddle to bounce a ball and break bricks",
        state_space=SpaceInfo(type="discrete", n=1000),  # 10x10x10 discretization
        action_space=SpaceInfo(type="discrete", n=4),
        max_episode_steps=1000
    ),
    EnvironmentType.GYM4REAL_DAM: Environment(
        id="gym4real_dam",
        name="Gym4ReaL Dam",
        description="Real-world dam management - balance flood prevention and power generation",
        state_space=SpaceInfo(type="discrete", n=400),  # 20x20 discretization
        action_space=SpaceInfo(type="discrete", n=3),
        max_episode_steps=200
    )
}

@router.get("/", response_model=list[Environment])
def get_environments():
    """Get list of all available environments"""
    return list(ENVIRONMENT_INFO.values())

@router.get("/{env_id}", response_model=Environment)
def get_environment(env_id: str):
    """Get details for a specific environment"""
    for env_type, info in ENVIRONMENT_INFO.items():
        if env_type.value == env_id:
            return info
    return {"error": "Environment not found"}

