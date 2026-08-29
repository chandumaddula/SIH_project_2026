from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.complaint import Complaint, ComplaintEvidence
from app.core.deps import get_current_user_optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/complaints", tags=["Complaints"])

class ComplaintCreate(BaseModel):
    product_id: Optional[str] = None
    description: str

class ComplaintResponse(BaseModel):
    id: int
    citizen_id: str
    product_id: Optional[str] = None
    description: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    citizen_id = current_user.id if current_user else "citizen-anon"
    complaint = Complaint(
        citizen_id=citizen_id,
        product_id=payload.product_id,
        description=payload.description,
        status="PENDING",
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint

@router.get("", response_model=List[ComplaintResponse])
@router.get("/", response_model=List[ComplaintResponse])
def list_complaints(db: Session = Depends(get_db)):
    return db.query(Complaint).order_by(Complaint.created_at.desc()).all()
