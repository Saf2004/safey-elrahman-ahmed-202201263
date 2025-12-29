import numpy as np
from typing import Generator, Dict, Any, Union
from app.algorithms.base import RLAlgorithm
from app.models.schemas import TrainingConfig, TrainingUpdate

class ValueIteration(RLAlgorithm):
    """Value Iteration: Model-based DP algorithm"""
    
    def __init__(self):
        self.value_function = {}
        self.policy = {}
        self.n_states = 0
        self.n_actions = 0
    
    def train(self, env, config: TrainingConfig) -> Generator[TrainingUpdate, None, None]:
        if not env.is_model_based():
            raise ValueError("Value Iteration requires a model-based environment")
        
        state_space = env.get_state_space()
        action_space = env.get_action_space()
        self.n_states = state_space['n']
        self.n_actions = action_space['n']
        
        # Initialize value function
        V = np.zeros(self.n_states)
        
        theta = 1e-6  # Convergence threshold
        max_iterations = config.n_episodes
        
        for iteration in range(max_iterations):
            delta = 0
            
            for s in range(self.n_states):
                v = V[s]
                
                # Calculate Q-values for all actions
                action_values = np.zeros(self.n_actions)
                for a in range(self.n_actions):
                    transitions = env.get_transitions(s, a)
                    action_values[a] = sum(prob * (reward + config.discount_factor * V[next_s] * (not done))
                                           for prob, next_s, reward, done in transitions)
                
                # Bellman optimality update
                V[s] = np.max(action_values)
                delta = max(delta, abs(v - V[s]))
            
            # Extract policy from value function
            policy = np.zeros(self.n_states, dtype=int)
            for s in range(self.n_states):
                action_values = np.zeros(self.n_actions)
                for a in range(self.n_actions):
                    transitions = env.get_transitions(s, a)
                    action_values[a] = sum(prob * (reward + config.discount_factor * V[next_s] * (not done))
                                           for prob, next_s, reward, done in transitions)
                policy[s] = np.argmax(action_values)
            
            # Yield update periodically
            if iteration % 10 == 0 or iteration == max_iterations - 1:
                yield TrainingUpdate(
                    episode=iteration + 1,
                    step=0,
                    reward=0.0,
                    cumulative_reward=float(np.sum(V)),
                    state=0,
                    action=0,
                    value_function={str(i): float(V[i]) for i in range(self.n_states)},
                    policy={str(i): int(policy[i]) for i in range(self.n_states)}
                )
            
            # Check convergence
            if delta < theta:
                break
        
        self.value_function = V
        self.policy = policy
    
    def get_value_function(self) -> Dict[str, float]:
        return {str(i): float(self.value_function[i]) for i in range(self.n_states)}
    
    def get_policy(self) -> Dict[str, Any]:
        return {str(i): int(self.policy[i]) for i in range(self.n_states)}
    
    def select_action(self, state: Union[int, tuple]) -> int:
        if isinstance(state, tuple):
            state = state[0]
        return int(self.policy[int(state)])
