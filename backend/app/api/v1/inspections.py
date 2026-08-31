from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import get_current_user_optional
from app.schemas.inspection import InspectionCreate, InspectionResponse
from app.services import inspection_service

router = APIRouter(prefix="/inspections", tags=["Inspections"])

@router.post("", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
def create_inspection(
    payload: InspectionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    employee_id = current_user.id if current_user else "officer-anon"
    return inspection_service.create_inspection(db, payload, employee_id=employee_id)

@router.get("", response_model=List[InspectionResponse])
@router.get("/", response_model=List[InspectionResponse])
def list_inspections(db: Session = Depends(get_db)):
    return inspection_service.list_inspections(db)
