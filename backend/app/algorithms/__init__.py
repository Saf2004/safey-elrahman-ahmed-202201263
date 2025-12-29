from app.algorithms.q_learning import QLearning
from app.algorithms.sarsa import SARSA
from app.algorithms.policy_iteration import PolicyIteration
from app.algorithms.value_iteration import ValueIteration
from app.algorithms.monte_carlo import MonteCarlo
from app.algorithms.td import TDLearning
from app.algorithms.n_step_td import NStepTD
from app.algorithms.base import RLAlgorithm
from app.models.enums import AlgorithmType

def create_algorithm(algo_type: AlgorithmType) -> RLAlgorithm:
    """Factory function to create algorithms"""
    if algo_type == AlgorithmType.Q_LEARNING:
        return QLearning()
    elif algo_type == AlgorithmType.SARSA:
        return SARSA()
    elif algo_type == AlgorithmType.POLICY_ITERATION:
        return PolicyIteration()
    elif algo_type == AlgorithmType.VALUE_ITERATION:
        return ValueIteration()
    elif algo_type == AlgorithmType.MONTE_CARLO:
        return MonteCarlo()
    elif algo_type == AlgorithmType.TD_LEARNING:
        return TDLearning()
    elif algo_type == AlgorithmType.N_STEP_TD:
        return NStepTD()
    else:
        raise ValueError(f"Unknown algorithm type: {algo_type}")
