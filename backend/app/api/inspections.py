from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import get_current_user_optional
from app.schemas.inspection import (
    GuidedInspectionStart,
    InspectionWorkflowState,
    OfficerVerificationSchema,
)
from app.services import inspection_service

router = APIRouter(prefix="/inspections", tags=["Inspections"])

@router.post("/start", response_model=InspectionWorkflowState, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=InspectionWorkflowState, status_code=status.HTTP_201_CREATED)
def start_inspection(
    payload: GuidedInspectionStart,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    employee_id = current_user.id if current_user else (payload.officer_id or "officer-anon")
    result = inspection_service.start_guided_inspection(db, payload, employee_id=employee_id)
    return InspectionWorkflowState(**result)

@router.get("", response_model=List[InspectionWorkflowState])
@router.get("/", response_model=List[InspectionWorkflowState])
def list_inspections(db: Session = Depends(get_db)):
    inspections = inspection_service.list_inspections(db)
    result = []
    for insp in inspections:
        result.append(InspectionWorkflowState(
            id=insp.id,
            session_id=f"SESS-{insp.id}-2026",
            product_id=insp.product_id or "PROD-101",
            product_name=insp.product_id or "Packaged Commodity",
            category="Packaged Food",
            location=insp.location or "Regional Market",
            officer_id=insp.employee_id or "officer-01",
            status=insp.status,
            step="final",
            extracted={
                "product_name": insp.product_id or "Packaged Commodity",
                "mrp": "₹ 150.00",
                "net_quantity": "500 g",
                "manufacturer": "ABC Foods Pvt. Ltd.",
            },
            evidences=[],
            created_at=insp.inspection_date,
        ))
    return result

@router.get("/{inspection_id}", response_model=InspectionWorkflowState)
def get_inspection_detail(inspection_id: str, db: Session = Depends(get_db)):
    result = inspection_service.get_guided_inspection_detail(db, inspection_id)
    return InspectionWorkflowState(**result)

@router.post("/{inspection_id}/verify")
def verify_officer_signoff(
    inspection_id: str,
    payload: OfficerVerificationSchema,
    db: Session = Depends(get_db)
):
    return inspection_service.verify_and_signoff_inspection(db, inspection_id, payload)
