from enum import Enum

class EnvironmentType(str, Enum):
    GRIDWORLD = "gridworld"
    CARTPOLE = "cartpole"
    FROZENLAKE = "frozenlake"
    MOUNTAINCAR = "mountaincar"
    BREAKOUT = "breakout"
    GYM4REAL_DAM = "gym4real_dam"

class AlgorithmType(str, Enum):
    POLICY_ITERATION = "policy_iteration"
    VALUE_ITERATION = "value_iteration"
    Q_LEARNING = "q_learning"
    SARSA = "sarsa"
    MONTE_CARLO = "monte_carlo"
    TD_LEARNING = "td_learning"
    N_STEP_TD = "n_step_td"
