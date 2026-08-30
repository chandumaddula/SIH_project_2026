from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from app.database.session import get_db
from app.models.inspection import Inspection, ComplianceResult, Violation

router = APIRouter(prefix="/compliance", tags=["Compliance"])

class ComplianceCheckRequest(BaseModel):
    inspection_id: Optional[int] = None
    product_name: Optional[str] = None
    mrp_present: bool = True
    net_quantity_present: bool = True
    manufacturer_present: bool = True
    consumer_care_present: bool = True

class ViolationResponse(BaseModel):
    id: int
    inspection_id: int
    rule_reference: str
    description: str
    severity: str
    status: str

    model_config = ConfigDict(from_attributes=True)

class ComplianceCheckResponse(BaseModel):
    overall_status: str
    compliance_score: float
    violations: List[dict]

@router.post("/check", response_model=ComplianceCheckResponse)
def check_compliance(payload: ComplianceCheckRequest, db: Session = Depends(get_db)):
    violations = []
    total_checks = 4
    passed_checks = 0

    if payload.mrp_present:
        passed_checks += 1
    else:
        violations.append({
            "rule_reference": "LM-RULE-6(1)(e)",
            "description": "Missing Maximum Retail Price (MRP) declaration on package label.",
            "severity": "CRITICAL"
        })

    if payload.net_quantity_present:
        passed_checks += 1
    else:
        violations.append({
            "rule_reference": "LM-RULE-6(1)(c)",
            "description": "Missing Net Quantity declaration.",
            "severity": "HIGH"
        })

    if payload.manufacturer_present:
        passed_checks += 1
    else:
        violations.append({
            "rule_reference": "LM-RULE-6(1)(a)",
            "description": "Missing Manufacturer Name/Address details.",
            "severity": "HIGH"
        })

    if payload.consumer_care_present:
        passed_checks += 1
    else:
        violations.append({
            "rule_reference": "LM-RULE-6(1)(h)",
            "description": "Missing Consumer Care contact details.",
            "severity": "MEDIUM"
        })

    score = passed_checks / total_checks
    overall_status = "COMPLIANT" if score == 1.0 else ("WARNING" if score >= 0.5 else "NON_COMPLIANT")

    if payload.inspection_id:
        inspection = db.query(Inspection).filter(Inspection.id == payload.inspection_id).first()
        if inspection:
            comp_res = ComplianceResult(
                inspection_id=inspection.id,
                overall_status=overall_status,
                compliance_score=score
            )
            db.add(comp_res)

            for v in violations:
                viol = Violation(
                    inspection_id=inspection.id,
                    rule_reference=v["rule_reference"],
                    description=v["description"],
                    severity=v["severity"],
                    status="OPEN"
                )
                db.add(viol)
            
            inspection.status = overall_status
            db.commit()

    return {
        "overall_status": overall_status,
        "compliance_score": score,
        "violations": violations
    }

@router.get("/violations", response_model=List[ViolationResponse])
def list_violations(db: Session = Depends(get_db)):
    return db.query(Violation).all()

@router.get("/results/{inspection_id}")
def get_compliance_result(inspection_id: int, db: Session = Depends(get_db)):
    results = db.query(ComplianceResult).filter(ComplianceResult.inspection_id == inspection_id).all()
    violations = db.query(Violation).filter(Violation.inspection_id == inspection_id).all()
    return {
        "inspection_id": inspection_id,
        "compliance_results": [
            {
                "id": r.id,
                "overall_status": r.overall_status,
                "compliance_score": r.compliance_score,
                "created_at": r.created_at
            }
            for r in results
        ],
        "violations": [
            {
                "id": v.id,
                "rule_reference": v.rule_reference,
                "description": v.description,
                "severity": v.severity,
                "status": v.status
            }
            for v in violations
        ]
    }
