from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    MAX_SESSIONS: int = 100
    SESSION_TTL: int = 3600
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"

settings = Settings()
