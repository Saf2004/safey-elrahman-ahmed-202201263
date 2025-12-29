export interface TrainingConfig {
    environment: string;
    algorithm: string;
    discount_factor: number;
    learning_rate: number;
    epsilon: number;
    n_episodes: number;
    max_steps: number;
    n_step: number;
    step_delay_ms: number;
}

export interface TrainingUpdate {
    episode: number;
    step: number;
    reward: number;
    cumulative_reward: number;
    state: any;
    action: number;
    value_function?: Record<string, number> | null;
    policy?: Record<string, number> | null;
}

export interface TrainingStatus {
    session_id: string;
    is_running: boolean;
    current_episode: number;
    total_episodes: number;
    elapsed_time: number;
    config: TrainingConfig;
}

export interface TrainingMetrics {
    episode_rewards: number[];
    episode_lengths: number[];
    cumulative_rewards: number[];
}
