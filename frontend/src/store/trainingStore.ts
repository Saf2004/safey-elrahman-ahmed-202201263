import { create } from 'zustand';
import { TrainingWebSocket } from '../services/websocket';
import { startTraining, stopTraining } from '../services/api';
import type { TrainingConfig, TrainingUpdate, TrainingMetrics } from '../types/training';

interface TrainingState {
    sessionId: string | null;
    isRunning: boolean;
    updates: TrainingUpdate[];
    config: TrainingConfig | null;
    metrics: TrainingMetrics;
    valueFunction: Record<string, number> | null;
    policy: Record<string, number> | null;
    ws: TrainingWebSocket | null;

    // Actions
    startSession: (config: TrainingConfig) => Promise<void>;
    stopSession: () => Promise<void>;
    addUpdate: (update: TrainingUpdate) => void;
    clearUpdates: () => void;
    reset: () => void;
}

export const useTrainingStore = create<TrainingState>((set, get) => ({
    sessionId: null,
    isRunning: false,
    updates: [],
    config: null,
    metrics: {
        episode_rewards: [],
        episode_lengths: [],
        cumulative_rewards: [],
    },
    valueFunction: null,
    policy: null,
    ws: null,

    startSession: async (config) => {
        try {
            const { session_id } = await startTraining(config);
            set({
                sessionId: session_id,
                isRunning: true,
                config,
                updates: [],
                metrics: {
                    episode_rewards: [],
                    episode_lengths: [],
                    cumulative_rewards: [],
                },
                valueFunction: null,
                policy: null,
            });

            const ws = new TrainingWebSocket(
                session_id,
                (update: TrainingUpdate) => {
                    get().addUpdate(update);
                },
                () => {
                    // Training completed - reset running state
                    set({ isRunning: false });
                }
            );
            ws.connect();
            set({ ws });
        } catch (error) {
            console.error('Failed to start session', error);
            set({ isRunning: false });
        }
    },

    stopSession: async () => {
        const { sessionId, ws } = get();
        if (sessionId) {
            try {
                await stopTraining(sessionId);
            } catch (error) {
                console.error('Failed to stop session', error);
            }
            ws?.disconnect();
            set({ isRunning: false, ws: null });
        }
    },

    addUpdate: (update) => {
        set((state) => {
            // Limit updates array to last 1000 items to prevent memory issues
            const newUpdates = [...state.updates, update].slice(-1000);

            // Properly clone metrics arrays instead of mutating
            const newMetrics = {
                episode_rewards: [...state.metrics.episode_rewards, update.reward].slice(-1000),
                cumulative_rewards: [...state.metrics.cumulative_rewards, update.cumulative_reward].slice(-1000),
                episode_lengths: [...state.metrics.episode_lengths, update.step].slice(-1000),
            };

            return {
                updates: newUpdates,
                metrics: newMetrics,
                valueFunction: update.value_function || state.valueFunction,
                policy: update.policy || state.policy,
            };
        });
    },

    clearUpdates: () =>
        set({
            updates: [],
            metrics: {
                episode_rewards: [],
                episode_lengths: [],
                cumulative_rewards: [],
            },
        }),

    reset: () =>
        set({
            sessionId: null,
            isRunning: false,
            updates: [],
            config: null,
            metrics: {
                episode_rewards: [],
                episode_lengths: [],
                cumulative_rewards: [],
            },
            valueFunction: null,
            policy: null,
            ws: null,
        }),
}));

