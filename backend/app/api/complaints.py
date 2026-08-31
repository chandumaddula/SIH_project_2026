from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import get_current_user_optional
from app.schemas.complaint import ComplaintCreateSchema, ComplaintStatusUpdateSchema, ComplaintResponseSchema
from app.services import complaint_service

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.post("", response_model=ComplaintResponseSchema, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ComplaintResponseSchema, status_code=status.HTTP_201_CREATED)
def create_complaint(
    payload: ComplaintCreateSchema,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    citizen_id = current_user.id if current_user else "citizen-anon"
    result = complaint_service.create_citizen_complaint(db, payload, citizen_id=citizen_id)
    return ComplaintResponseSchema(**result)

@router.get("", response_model=List[ComplaintResponseSchema])
@router.get("/", response_model=List[ComplaintResponseSchema])
def list_complaints(db: Session = Depends(get_db)):
    complaints = complaint_service.list_complaints(db)
    result = []
    for c in complaints:
        result.append(ComplaintResponseSchema(
            id=f"CMP-2026-0{c.id}",
            citizen_id=c.citizen_id,
            product_name=c.product_id or "Packaged Commodity",
            issue_type="MRP Discrepancy",
            description=c.description,
            location="ABC Market, MG Road",
            priority="HIGH",
            status=c.status,
            evidence_count=2,
            submitted_at=c.created_at,
            updated_at=c.created_at,
        ))
    return result

@router.get("/{complaint_id}", response_model=ComplaintResponseSchema)
def get_complaint_detail(complaint_id: str, db: Session = Depends(get_db)):
    return ComplaintResponseSchema(
        id=complaint_id,
        citizen_id="citizen-101",
        product_name="ABC Biscuits Premium Pack",
        issue_type="MRP Discrepancy",
        description="Printed MRP is higher than advertised maximum price.",
        location="ABC Supermarket, MG Road",
        priority="HIGH",
        status="UNDER_REVIEW",
        evidence_count=3,
        submitted_at="2026-08-31T09:00:00Z",
        updated_at="2026-08-31T10:00:00Z",
    )

@router.patch("/{complaint_id}/status")
@router.put("/{complaint_id}/status")
def update_complaint_status(
    complaint_id: str,
    payload: ComplaintStatusUpdateSchema,
    db: Session = Depends(get_db)
):
    return complaint_service.update_complaint_status_workflow(db, complaint_id, payload)
