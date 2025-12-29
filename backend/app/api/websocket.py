from fastapi import APIRouter, WebSocket, Depends, HTTPException
from app.services.training import training_service

router = APIRouter()

@router.websocket("/ws/training/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await training_service.connect_websocket(session_id, websocket)
