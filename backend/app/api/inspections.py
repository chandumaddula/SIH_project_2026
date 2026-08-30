from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.inspection import Inspection
from app.core.deps import get_current_user_optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

router = APIRouter(prefix="/inspections", tags=["Inspections"])

class InspectionCreate(BaseModel):
    product_id: Optional[str] = None
    location: Optional[str] = None
    remarks: Optional[str] = None

class InspectionResponse(BaseModel):
    id: int
    employee_id: Optional[str] = None
    product_id: Optional[str] = None
    status: str
    inspection_date: datetime
    location: Optional[str] = None
    remarks: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

@router.post("", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
def create_inspection(
    payload: InspectionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    employee_id = current_user.id if current_user else "officer-anon"
    inspection = Inspection(
        employee_id=employee_id,
        product_id=payload.product_id,
        location=payload.location,
        remarks=payload.remarks,
        status="PENDING",
    )
    db.add(inspection)
    db.commit()
    db.refresh(inspection)
    return inspection

@router.get("", response_model=List[InspectionResponse])
@router.get("/", response_model=List[InspectionResponse])
def list_inspections(db: Session = Depends(get_db)):
    return db.query(Inspection).order_by(Inspection.inspection_date.desc()).all()
