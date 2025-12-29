from fastapi import APIRouter, HTTPException
from app.models.schemas import TrainingConfig, TrainingStatus
from app.services.training import training_service

router = APIRouter()

@router.post("/start")
async def start_training_session(config: TrainingConfig):
    """Start a new training session"""
    try:
        session_id = training_service.create_session(config)
        # Auto-start training
        await training_service.start_training(session_id)
        return {"session_id": session_id, "status": "started"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{session_id}/stop")
async def stop_training_session(session_id: str):
    """Stop a running training session"""
    session = training_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    await training_service.stop_training(session_id)
    return {"status": "stopped"}

@router.get("/{session_id}/status", response_model=TrainingStatus)
async def get_training_status(session_id: str):
    """Get status of a training session"""
    session = training_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session.get_status()

@router.delete("/{session_id}")
async def delete_training_session(session_id: str):
    """Delete a training session"""
    session = training_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    training_service.delete_session(session_id)
    return {"status": "deleted"}

