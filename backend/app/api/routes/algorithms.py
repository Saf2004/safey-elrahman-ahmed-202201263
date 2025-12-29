from fastapi import APIRouter
from app.models.enums import AlgorithmType
from app.models.schemas import Algorithm

router = APIRouter()

ALGORITHM_INFO = {
    AlgorithmType.Q_LEARNING: Algorithm(
        id="q_learning",
        name="Q-Learning",
        description="Off-policy TD control algorithm. Learns optimal Q-values using max operator.",
        requires_model=False,
        compatible_environments=["gridworld", "frozenlake", "cartpole", "mountaincar"],
        parameters={"learning_rate": 0.1, "epsilon": 0.1, "discount_factor": 0.99}
    ),
    AlgorithmType.SARSA: Algorithm(
        id="sarsa",
        name="SARSA",
        description="On-policy TD control. Updates Q-values using the actual next action taken.",
        requires_model=False,
        compatible_environments=["gridworld", "frozenlake", "cartpole", "mountaincar"],
        parameters={"learning_rate": 0.1, "epsilon": 0.1, "discount_factor": 0.99}
    ),
    AlgorithmType.POLICY_ITERATION: Algorithm(
        id="policy_iteration",
        name="Policy Iteration",
        description="Model-based DP with policy evaluation and improvement steps.",
        requires_model=True,
        compatible_environments=["gridworld", "frozenlake"],
        parameters={"discount_factor": 0.99}
    ),
    AlgorithmType.VALUE_ITERATION: Algorithm(
        id="value_iteration",
        name="Value Iteration",
        description="Model-based DP using Bellman optimality updates.",
        requires_model=True,
        compatible_environments=["gridworld", "frozenlake"],
        parameters={"discount_factor": 0.99}
    ),
    AlgorithmType.MONTE_CARLO: Algorithm(
        id="monte_carlo",
        name="Monte Carlo",
        description="Episode-based learning without bootstrapping. Uses complete returns.",
        requires_model=False,
        compatible_environments=["gridworld", "frozenlake", "cartpole", "mountaincar"],
        parameters={"epsilon": 0.1, "discount_factor": 0.99}
    ),
    AlgorithmType.TD_LEARNING: Algorithm(
        id="td_learning",
        name="TD Learning",
        description="n-step temporal difference learning with configurable lookahead.",
        requires_model=False,
        compatible_environments=["gridworld", "frozenlake", "cartpole", "mountaincar"],
        parameters={"learning_rate": 0.1, "epsilon": 0.1, "discount_factor": 0.99, "n_step": 1}
    ),
    AlgorithmType.N_STEP_TD: Algorithm(
        id="n_step_td",
        name="n-Step TD",
        description="Multi-step temporal difference learning.",
        requires_model=False,
        compatible_environments=["gridworld", "frozenlake", "cartpole", "mountaincar"],
        parameters={"learning_rate": 0.1, "epsilon": 0.1, "discount_factor": 0.99, "n_step": 3}
    )
}

@router.get("/", response_model=list[Algorithm])
def get_algorithms():
    """Get list of all available algorithms"""
    return list(ALGORITHM_INFO.values())

@router.get("/{algo_id}", response_model=Algorithm)
def get_algorithm(algo_id: str):
    """Get details for a specific algorithm"""
    for algo_type, info in ALGORITHM_INFO.items():
        if algo_type.value == algo_id:
            return info
    return {"error": "Algorithm not found"}

