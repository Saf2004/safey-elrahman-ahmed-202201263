import uuid
import asyncio
import time
from typing import Dict, Any, Optional
from fastapi import WebSocket
from app.models.schemas import TrainingConfig, TrainingUpdate, TrainingStatus
from app.models.enums import AlgorithmType, EnvironmentType
from app.environments import create_environment
from app.algorithms import create_algorithm

class TrainingSession:
    def __init__(self, config: TrainingConfig):
        self.id = str(uuid.uuid4())
        self.config = config
        self.is_running = False
        self.env = create_environment(config.environment)
        self.algorithm = create_algorithm(config.algorithm)
        self.websocket: Optional[WebSocket] = None
        self.task: Optional[asyncio.Task] = None
        self.created_at = time.time()
        self.current_episode = 0
        self.start_time: Optional[float] = None

    def get_elapsed_time(self) -> float:
        if self.start_time is None:
            return 0.0
        return time.time() - self.start_time
    
    def get_status(self) -> TrainingStatus:
        return TrainingStatus(
            session_id=self.id,
            is_running=self.is_running,
            current_episode=self.current_episode,
            total_episodes=self.config.n_episodes,
            elapsed_time=self.get_elapsed_time(),
            config=self.config
        )

class TrainingService:
    def __init__(self, max_sessions: int = 100, session_ttl: int = 3600):
        self.sessions: Dict[str, TrainingSession] = {}
        self.max_sessions = max_sessions
        self.session_ttl = session_ttl  # Time-to-live in seconds

    def create_session(self, config: TrainingConfig) -> str:
        # Clean up expired sessions before creating new one
        self._cleanup_expired_sessions()
        
        if len(self.sessions) >= self.max_sessions:
            raise ValueError(f"Maximum number of sessions ({self.max_sessions}) reached")
        
        session = TrainingSession(config)
        self.sessions[session.id] = session
        return session.id

    def get_session(self, session_id: str) -> Optional[TrainingSession]:
        return self.sessions.get(session_id)

    def delete_session(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]

    def _cleanup_expired_sessions(self):
        """Remove sessions older than TTL"""
        current_time = time.time()
        expired = [
            sid for sid, session in self.sessions.items()
            if current_time - session.created_at > self.session_ttl
        ]
        for sid in expired:
            del self.sessions[sid]

    async def connect_websocket(self, session_id: str, websocket: WebSocket):
        session = self.get_session(session_id)
        if not session:
            await websocket.close(code=4004, reason="Session not found")
            return
        
        await websocket.accept()
        session.websocket = websocket
        
        try:
            while True:
                # Keep connection open, listen for control messages
                data = await websocket.receive_text()
                if data == "STOP":
                    await self.stop_training(session_id)
                elif data == "START":
                    await self.start_training(session_id)
        except Exception as e:
            print(f"WebSocket disconnected: {e}")
        finally:
            session.websocket = None

    async def start_training(self, session_id: str):
        session = self.get_session(session_id)
        if not session or session.is_running:
            return

        session.is_running = True
        session.start_time = time.time()
        session.task = asyncio.create_task(self._training_loop(session))

    async def stop_training(self, session_id: str):
        session = self.get_session(session_id)
        if not session or not session.is_running:
            return

        session.is_running = False
        if session.task:
            session.task.cancel()
            try:
                await session.task
            except asyncio.CancelledError:
                pass
            session.task = None

    async def _training_loop(self, session: TrainingSession):
        try:
            generator = session.algorithm.train(session.env, session.config)
            for update in generator:
                if not session.is_running:
                    break
                
                session.current_episode = update.episode
                
                if session.websocket:
                    try:
                        await session.websocket.send_text(update.model_dump_json())
                    except Exception as e:
                        print(f"Error sending update: {e}")
                        break
                
                # Sleep to slow down visualization - use configurable delay
                delay_seconds = session.config.step_delay_ms / 1000.0
                await asyncio.sleep(delay_seconds)
            
            # Send completion message when training finishes
            if session.websocket and session.is_running:
                try:
                    import json
                    await session.websocket.send_text(json.dumps({"status": "completed"}))
                except Exception as e:
                    print(f"Error sending completion message: {e}")
                
        except Exception as e:
            print(f"Error in training loop: {e}")
            import traceback
            traceback.print_exc()
            if session.websocket:
                try:
                    await session.websocket.close(code=1011, reason=str(e))
                except:
                    pass
        finally:
            session.is_running = False

# Singleton instance
training_service = TrainingService()

