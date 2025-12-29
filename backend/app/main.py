from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import environments, algorithms, training
from app.api import websocket

app = FastAPI(title="RL Interactive Learning Tool API")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(environments.router, prefix="/api/v1/environments", tags=["environments"])
app.include_router(algorithms.router, prefix="/api/v1/algorithms", tags=["algorithms"])
app.include_router(training.router, prefix="/api/v1/training", tags=["training"])
app.include_router(websocket.router, tags=["websocket"])

@app.get("/")
async def root():
    return {"message": "Welcome to RL Interactive Learning Tool API"}
