from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.compliance import ComplianceCheckRequest, ComplianceCheckResponse, ViolationResponse
from app.services import compliance_service

router = APIRouter(prefix="/compliance", tags=["Compliance"])

@router.post("/check", response_model=ComplianceCheckResponse)
def check_compliance(payload: ComplianceCheckRequest, db: Session = Depends(get_db)):
    return compliance_service.check_and_record_compliance(db, payload)

@router.get("/violations", response_model=List[ViolationResponse])
def list_violations(db: Session = Depends(get_db)):
    return compliance_service.list_violations(db)

@router.get("/results/{inspection_id}")
def get_compliance_result(inspection_id: int, db: Session = Depends(get_db)):
    return compliance_service.get_compliance_results(db, inspection_id)
