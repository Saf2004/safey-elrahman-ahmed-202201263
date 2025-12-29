import numpy as np
from typing import Generator, Dict, Any, Union, List
from app.algorithms.base import RLAlgorithm
from app.models.schemas import TrainingConfig, TrainingUpdate
from app.models.enums import EnvironmentType

class NStepTD(RLAlgorithm):
    """n-step Temporal Difference Learning algorithm"""
    
    def __init__(self):
        self.q_table = {}
        self.n_states = 0
        self.n_actions = 0
    
    def _epsilon_greedy(self, state: int, epsilon: float) -> int:
        """Epsilon-greedy action selection"""
        if np.random.random() < epsilon:
            return np.random.randint(self.n_actions)
        else:
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
        n_step = config.n_step
        
        for episode in range(config.n_episodes):
            state_info = env.reset()
            state = state_info.observation
            action = self._epsilon_greedy(state, config.epsilon)
            
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
            
            states: List[int] = []
            actions: List[int] = []
            rewards: List[float] = []
            
            states.append(state)
            actions.append(action)
            
            T = float('inf')
            t = 0
            episode_reward = 0
            episode_steps = 0
            
            while True:
                if t < T:
                    next_state_info = env.step(action)
                    next_state = next_state_info.observation
                    reward = next_state_info.reward
                    done = next_state_info.done
                    
                    rewards.append(reward)
                    episode_reward += reward
                    episode_steps += 1
                    
                    visualization_state = state
                    if config.environment == EnvironmentType.CARTPOLE:
                        if 'continuous_state' in next_state_info.info:
                            visualization_state = next_state_info.info['continuous_state']
                    elif config.environment == EnvironmentType.MOUNTAINCAR:
                        if 'continuous_state' in next_state_info.info:
                            visualization_state = next_state_info.info['continuous_state']
                    elif config.environment == EnvironmentType.BREAKOUT:
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
                    
                    yield TrainingUpdate(
                        episode=episode + 1,
                        step=episode_steps,
                        reward=reward,
                        cumulative_reward=cumulative_reward + episode_reward,
                        state=visualization_state,
                        action=action,
                        value_function=None,
                        policy=None
                    )
                    
                    if done:
                        T = t + 1
                    else:
                        next_action = self._epsilon_greedy(next_state, config.epsilon)
                        states.append(next_state)
                        actions.append(next_action)
                        action = next_action
                
                tau = t - n_step + 1
                
                if tau >= 0:
                    G = sum([config.discount_factor ** (i - tau - 1) * rewards[i] 
                            for i in range(tau, min(tau + n_step, T))])
                    
                    if tau + n_step < T:
                        s_future = states[tau + n_step]
                        a_future = actions[tau + n_step]
                        G += (config.discount_factor ** n_step) * self.q_table[s_future][a_future]
                    
                    s_tau = states[tau]
                    a_tau = actions[tau]
                    self.q_table[s_tau][a_tau] += config.learning_rate * (G - self.q_table[s_tau][a_tau])
                
                if tau == T - 1:
                    break
                
                t += 1
            
            cumulative_reward += episode_reward
            
            if episode % 50 == 0:
                yield TrainingUpdate(
                    episode=episode + 1,
                    step=episode_steps,
                    reward=episode_reward,
                    cumulative_reward=cumulative_reward,
                    state=state,
                    action=0,
                    value_function=self.get_value_function(),
                    policy=self.get_policy()
                )
    
    def get_value_function(self) -> Dict[str, float]:
        return {str(i): float(np.max(self.q_table[i])) for i in range(self.n_states)}
    
    def get_policy(self) -> Dict[str, Any]:
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

