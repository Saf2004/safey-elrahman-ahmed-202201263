import numpy as np
from typing import Generator, Dict, Any, Union, List
from collections import defaultdict
from app.algorithms.base import RLAlgorithm
from app.models.schemas import TrainingConfig, TrainingUpdate
from app.models.enums import EnvironmentType

class MonteCarlo(RLAlgorithm):
    """Monte Carlo Control with epsilon-greedy policy"""
    
    def __init__(self, first_visit: bool = True):
        self.q_table = {}
        self.returns = defaultdict(list)  #Track returns for each (state, action) pair
        self.n_states = 0
        self.n_actions = 0
        self.first_visit = first_visit
    
    def _epsilon_greedy(self, state: int, epsilon: float) -> int:
        """Epsilon-greedy action selection"""
        if np.random.random() < epsilon:
            return np.random.randint(self.n_actions)
        else:
            # Break ties randomly when Q-values are equal
            q_values = self.q_table[state]
            max_q = np.max(q_values)
            best_actions = np.where(q_values == max_q)[0]
            return int(np.random.choice(best_actions))
    
    def train(self, env, config: TrainingConfig) -> Generator[TrainingUpdate, None, None]:
        state_space = env.get_state_space()
        action_space = env.get_action_space()
        self.n_states = state_space['n']
        self.n_actions = action_space['n']
        
        self.q_table = np.random.uniform(-0.01, 0.01, (self.n_states, self.n_actions))
        
        cumulative_reward = 0.0
        
        for episode in range(config.n_episodes):
            # Generate episode
            episode_history: List[tuple] = []  # (state, action, reward)
            state_info = env.reset()
            state = state_info.observation
            episode_reward = 0
            
            # For CartPole and MountainCar, send continuous state for visualization on reset
            if config.environment == EnvironmentType.CARTPOLE or config.environment == EnvironmentType.MOUNTAINCAR:
                if 'continuous_state' in state_info.info:
                    yield TrainingUpdate(
                        episode=episode + 1,
                        step=0,
                        reward=0.0,
                        cumulative_reward=cumulative_reward,
                        state=state_info.info['continuous_state'],
                        action=0,
                        value_function=None,
                        policy=None
                    )
            
            for step in range(config.max_steps):
                action = self._epsilon_greedy(state, config.epsilon)
                next_state_info = env.step(action)
                reward = next_state_info.reward
                done = next_state_info.done
                
                episode_history.append((state, action, reward))
                episode_reward += reward
                
                # For CartPole and MountainCar, send continuous state for visualization
                # For Breakout, send render data (paddle_x, ball_x, ball_y, lives)
                visualization_state = state
                if config.environment == EnvironmentType.CARTPOLE:
                    if 'continuous_state' in next_state_info.info:
                        visualization_state = next_state_info.info['continuous_state']
                elif config.environment == EnvironmentType.MOUNTAINCAR:
                    if 'continuous_state' in next_state_info.info:
                        visualization_state = next_state_info.info['continuous_state']
                elif config.environment == EnvironmentType.BREAKOUT:
                    # Use render data for Breakout visualization
                    render_data = env.render()
                    visualization_state = {
                        'paddle_x': render_data.get('paddle_x', 80),
                        'ball_x': render_data.get('ball_x', 80),
                        'ball_y': render_data.get('ball_y', 100),
                        'ball_vel_x': render_data.get('ball_vel_x', 0),
                        'ball_vel_y': render_data.get('ball_vel_y', 0),
                        'lives': render_data.get('lives', 5),
                        'score': render_data.get('score', 0),
                        'bricks_destroyed': render_data.get('bricks_destroyed', 0),
                        'remaining_bricks': render_data.get('remaining_bricks', 40)
                    }
                
                # Yield update on every step for real-time visualization
                yield TrainingUpdate(
                    episode=episode + 1,
                    step=step + 1,
                    reward=reward,
                    cumulative_reward=cumulative_reward + episode_reward,
                    state=visualization_state,
                    action=action,
                    value_function=self.get_value_function() if done and episode % 50 == 0 else None,
                    policy=self.get_policy() if done and episode % 50 == 0 else None
                )
                
                state = next_state_info.observation
                if done:
                    break
            
           # Update Q-values using episode returns
            G = 0  # Return
            visited_pairs = set()
            
            # Process episode in reverse
            for t in range(len(episode_history) - 1, -1, -1):
                state, action, reward = episode_history[t]
                G = config.discount_factor * G + reward
                
                pair = (state, action)
                
                # First-visit or every-visit MC
                if self.first_visit and pair in visited_pairs:
                    continue
                
                visited_pairs.add(pair)
                self.returns[pair].append(G)
                self.q_table[state][action] = np.mean(self.returns[pair])
            
            cumulative_reward += episode_reward
    
    def get_value_function(self) -> Dict[str, float]:
        return {str(i): float(np.max(self.q_table[i])) for i in range(self.n_states)}
    
    def get_policy(self) -> Dict[str, Any]:
        # Break ties randomly when Q-values are equal
        policy = {}
        for i in range(self.n_states):
            q_values = self.q_table[i]
            max_q = np.max(q_values)
            best_actions = np.where(q_values == max_q)[0]
            policy[str(i)] = int(np.random.choice(best_actions))
        return policy
    
    def select_action(self, state: Union[int, tuple]) -> int:
        if isinstance(state, tuple):
            state = state[0]
        q_values = self.q_table[int(state)]
        max_q = np.max(q_values)
        best_actions = np.where(q_values == max_q)[0]
        return int(np.random.choice(best_actions))
