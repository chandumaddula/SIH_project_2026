from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import get_current_user_optional
from app.schemas.complaint import ComplaintCreate, ComplaintResponse
from app.services import complaint_service

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    citizen_id = current_user.id if current_user else "citizen-anon"
    return complaint_service.create_complaint(db, payload, citizen_id=citizen_id)

@router.get("", response_model=List[ComplaintResponse])
@router.get("/", response_model=List[ComplaintResponse])
def list_complaints(db: Session = Depends(get_db)):
    return complaint_service.list_complaints(db)
