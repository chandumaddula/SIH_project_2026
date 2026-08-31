from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.inspection import Inspection, ComplianceResult, Violation
from app.schemas.compliance import ComplianceCheckRequest

def check_and_record_compliance(db: Session, payload: ComplianceCheckRequest) -> Dict[str, Any]:
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

def list_violations(db: Session) -> List[Violation]:
    return db.query(Violation).all()

def get_compliance_results(db: Session, inspection_id: int) -> Dict[str, Any]:
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
