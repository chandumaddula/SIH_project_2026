from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.session import get_db
from app.schemas.compliance import (
    ComplianceCheckRequest,
    ComplianceCheckResponse,
    ViolationResponse,
    OfficerReviewRequest,
)
from app.services import compliance_service
from rule_engine import LegalMetrologyComplianceEngine, ProductContext, ComplianceReport

router = APIRouter(prefix="/compliance", tags=["Compliance"])

class EvaluatePackagePayload(BaseModel):
    extracted_declarations: Dict[str, Any]
    context: Optional[ProductContext] = None
    scan_id: Optional[str] = None

@router.post("/evaluate", response_model=ComplianceReport)
def evaluate_legal_metrology_rules(payload: EvaluatePackagePayload):
    """
    Phase 7 Rule Engine Evaluation Endpoint:
    Takes extracted package data (Phase 6 OCR) + optional product context
    and executes deterministic Legal Metrology Rule validation.
    """
    engine = LegalMetrologyComplianceEngine()
    try:
        report = engine.evaluate_package_compliance(
            extracted_declarations=payload.extracted_declarations,
            context=payload.context,
            scan_id=payload.scan_id
        )
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Rule Engine Evaluation Error: {str(e)}"
        )

@router.post("/check", response_model=ComplianceCheckResponse)
def check_compliance(payload: ComplianceCheckRequest, db: Session = Depends(get_db)):
    """
    POST /compliance/check:
    Runs full Phase 7 Rule Engine pipeline and records database evidence & violation records.
    """
    return compliance_service.check_and_record_compliance(db, payload)

@router.get("/violations", response_model=List[ViolationResponse])
def list_all_violations(db: Session = Depends(get_db)):
    return compliance_service.list_violations(db)

@router.get("/results/{inspection_id}")
def get_compliance_results_by_inspection(inspection_id: int, db: Session = Depends(get_db)):
    return compliance_service.get_compliance_results(db, inspection_id)

@router.get("/{inspection_id}")
def get_inspection_compliance_detail(inspection_id: int, db: Session = Depends(get_db)):
    """GET /compliance/{id}: Retrieves compliance details for an inspection."""
    res = compliance_service.get_inspection_compliance(db, inspection_id)
    if res.get("status") == "NOT_FOUND":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Inspection #{inspection_id} not found.")
    return res

@router.get("/{inspection_id}/checks")
def get_inspection_checks_array(inspection_id: int, db: Session = Depends(get_db)):
    """GET /compliance/{id}/checks: Retrieves individual checks array for an inspection."""
    return compliance_service.get_inspection_checks(db, inspection_id)

@router.get("/{inspection_id}/violations", response_model=List[ViolationResponse])
def get_inspection_violations_list(inspection_id: int, db: Session = Depends(get_db)):
    """GET /compliance/{id}/violations: Retrieves violations list for an inspection."""
    res = compliance_service.get_compliance_results(db, inspection_id)
    return res.get("violations", [])

@router.post("/{inspection_id}/review")
def submit_officer_review_decision(inspection_id: int, payload: OfficerReviewRequest, db: Session = Depends(get_db)):
    """POST /compliance/{id}/review: Submits legal officer review decision."""
    res = compliance_service.submit_officer_review(db, inspection_id, payload)
    if res.get("status") == "ERROR":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=res["message"])
    return res
