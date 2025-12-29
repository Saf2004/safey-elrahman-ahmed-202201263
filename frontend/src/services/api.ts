import axios from 'axios';
import type { Environment } from '../types/environment';
import type { Algorithm } from '../types/algorithm';
import type { TrainingConfig, TrainingStatus } from '../types/training';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
    baseURL: API_URL,
});

// Environment endpoints
export const getEnvironments = async (): Promise<Environment[]> => {
    const response = await api.get<Environment[]>('/environments');
    return response.data;
};

export const getEnvironment = async (id: string): Promise<Environment> => {
    const response = await api.get<Environment>(`/environments/${id}`);
    return response.data;
};

// Algorithm endpoints
export const getAlgorithms = async (): Promise<Algorithm[]> => {
    const response = await api.get<Algorithm[]>('/algorithms');
    return response.data;
};

export const getAlgorithm = async (id: string): Promise<Algorithm> => {
    const response = await api.get<Algorithm>(`/algorithms/${id}`);
    return response.data;
};

// Training endpoints
export const startTraining = async (config: TrainingConfig) => {
    const response = await api.post<{ session_id: string; status: string }>('/training/start', config);
    return response.data;
};

export const stopTraining = async (sessionId: string) => {
    const response = await api.post(`/training/${sessionId}/stop`);
    return response.data;
};

export const getTrainingStatus = async (sessionId: string): Promise<TrainingStatus> => {
    const response = await api.get<TrainingStatus>(`/training/${sessionId}/status`);
    return response.data;
};

export const deleteTrainingSession = async (sessionId: string) => {
    const response = await api.delete(`/training/${sessionId}`);
    return response.data;
};

