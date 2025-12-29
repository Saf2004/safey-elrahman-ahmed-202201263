import type { TrainingUpdate } from '../types/training';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export class TrainingWebSocket {
    private ws: WebSocket | null = null;
    private onMessageCallback: ((data: TrainingUpdate) => void) | null = null;
    private onCompleteCallback: (() => void) | null = null;
    private sessionId: string;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: number | null = null;

    constructor(sessionId: string, onMessage: (data: TrainingUpdate) => void, onComplete?: () => void) {
        this.sessionId = sessionId;
        this.onMessageCallback = onMessage;
        this.onCompleteCallback = onComplete || null;
    }

    connect() {
        try {
            this.ws = new WebSocket(`${WS_URL}/ws/training/${this.sessionId}`);

            this.ws.onopen = () => {
                console.log('✅ Connected to Training WebSocket');
                this.reconnectAttempts = 0;
                // Auto-start training on connection
                this.ws?.send('START');
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // Check if this is a completion message
                    if (data.status === 'completed') {
                        console.log('✅ Training completed');
                        if (this.onCompleteCallback) {
                            this.onCompleteCallback();
                        }
                        return;
                    }

                    // Otherwise treat as regular training update
                    if (this.onMessageCallback) {
                        this.onMessageCallback(data as TrainingUpdate);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.ws.onclose = (event) => {
                console.log('Training WebSocket disconnected', event.code, event.reason);

                // Attempt to reconnect if not deliberately closed
                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.attemptReconnect();
                }
            };

            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
        }
    }

    private attemptReconnect() {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);

        this.reconnectTimeout = window.setTimeout(() => {
            this.connect();
        }, delay);
    }

    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        if (this.ws) {
            this.ws.send('STOP');
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
    }

    send(message: string) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        }
    }
}

