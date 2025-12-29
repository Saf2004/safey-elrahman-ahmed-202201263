import numpy as np
from typing import Generator, Dict, Any, Union
from app.algorithms.base import RLAlgorithm
from app.models.schemas import TrainingConfig, TrainingUpdate

class PolicyIteration(RLAlgorithm):
    """Policy Iteration: Model-based DP algorithm"""
    
    def __init__(self):
        self.value_function = {}
        self.policy = {}
        self.n_states = 0
        self.n_actions = 0
    
    def train(self, env, config: TrainingConfig) -> Generator[TrainingUpdate, None, None]:
        if not env.is_model_based():
            raise ValueError("Policy Iteration requires a model-based environment")
        
        state_space = env.get_state_space()
        action_space = env.get_action_space()
        self.n_states = state_space['n']
        self.n_actions = action_space['n']
        
        # Initialize value function and policy
        V = np.zeros(self.n_states)
        policy = np.zeros(self.n_states, dtype=int)
        
        theta = 1e-6  # Convergence threshold
        max_iterations = config.n_episodes  # Use n_episodes as iteration limit
        
        for iteration in range(max_iterations):
            # Policy Evaluation
            while True:
                delta = 0
                for s in range(self.n_states):
                    v = V[s]
                    action = policy[s]
                    
                    # Calculate expected value for current policy
                    transitions = env.get_transitions(s, action)
                    new_value = sum(prob * (reward + config.discount_factor * V[next_s] * (not done))
                                    for prob, next_s, reward, done in transitions)
                    V[s] = new_value
                    delta = max(delta, abs(v - V[s]))
                
                if delta < theta:
                    break
            
            # Policy Improvement
            policy_stable = True
            for s in range(self.n_states):
                old_action = policy[s]
                
                # Calculate Q-values for all actions
                action_values = np.zeros(self.n_actions)
                for a in range(self.n_actions):
                    transitions = env.get_transitions(s, a)
                    action_values[a] = sum(prob * (reward + config.discount_factor * V[next_s] * (not done))
                                           for prob, next_s, reward, done in transitions)
                
                # Select best action
                policy[s] = np.argmax(action_values)
                
                if old_action != policy[s]:
                    policy_stable = False
            
            # Yield update
            yield TrainingUpdate(
                episode=iteration + 1,
                step=0,
                reward=0.0,
                cumulative_reward=float(np.sum(V)),
                state=0,
                action=0,
                value_function=self.get_value_function_from_array(V),
                policy=self.get_policy_from_array(policy)
            )
            
            # Check for convergence
            if policy_stable:
                break
        
        self.value_function = V
        self.policy = policy
    
    def get_value_function(self) -> Dict[str, float]:
        return self.get_value_function_from_array(self.value_function)
    
    def get_value_function_from_array(self, V) -> Dict[str, float]:
        return {str(i): float(V[i]) for i in range(len(V))}
    
    def get_policy(self) -> Dict[str, Any]:
        return self.get_policy_from_array(self.policy)
    
    def get_policy_from_array(self, policy) -> Dict[str, Any]:
        return {str(i): int(policy[i]) for i in range(len(policy))}
    
    def select_action(self, state: Union[int, tuple]) -> int:
        if isinstance(state, tuple):
            state = state[0]
        return int(self.policy[int(state)])
