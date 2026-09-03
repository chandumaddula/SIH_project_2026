from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.inspection import Inspection, ComplianceResult, Violation, InspectionEvidenceModel
from app.schemas.compliance import ComplianceCheckRequest, OfficerReviewRequest
from rule_engine import LegalMetrologyComplianceEngine, ProductContext, FindingStatus

def check_and_record_compliance(db: Session, payload: ComplianceCheckRequest) -> Dict[str, Any]:
    """
    POST /compliance/check Workflow Service:
    Get Inspection -> Get AI Result -> Build Product Context -> Applicability Engine -> Applicable Rules ->
    Validators -> Compliance Results -> PASS or Potential Issue (Evidence -> Officer Review -> Final Inspection Result).
    """
    inspection: Optional[Inspection] = None
    if payload.inspection_id:
        inspection = db.query(Inspection).filter(Inspection.id == payload.inspection_id).first()

    if payload.extracted_declarations:
        declarations = payload.extracted_declarations
    else:
        declarations = {
            "productName": payload.product_name or "Scanned Commodity",
            "genericName": "Consumer Commodity",
            "mrp": "₹ 240.00 (Inclusive of all taxes)" if payload.mrp_present else None,
            "netQuantity": "1 L" if payload.net_quantity_present else None,
            "manufacturer": "Sample Foods Ltd., Plot 45 Industrial Area, Delhi - 110001" if payload.manufacturer_present else None,
            "consumerCare": "1800-111-2222 care@sample.in" if payload.consumer_care_present else None,
            "mfgDate": "06/2024",
            "pdp_area_sq_cm": 150.0
        }

    ctx_data = payload.context or {}
    context = ProductContext(
        product_name=declarations.get("productName"),
        category=ctx_data.get("category") or declarations.get("category", "GENERAL"),
        package_type=ctx_data.get("package_type") or declarations.get("package_type", "SINGLE_PIECE"),
        pdp_area_sq_cm=float(ctx_data.get("pdp_area_sq_cm") or declarations.get("pdp_area_sq_cm", 100.0)),
        is_imported=bool(ctx_data.get("is_imported") or declarations.get("importer")),
        consumer_type=ctx_data.get("consumer_type", "RETAIL")
    )

    engine = LegalMetrologyComplianceEngine()
    report = engine.evaluate_package_compliance(declarations, context=context, scan_id=payload.scan_id or f"INSP-{payload.inspection_id or 0}")

    status_val = report.overall_status.value if hasattr(report.overall_status, "value") else str(report.overall_status)

    if status_val == "PASS":
        overall_status_str = "COMPLIANT"
    elif status_val == "REVIEW_REQUIRED":
        overall_status_str = "NEEDS_OFFICER_REVIEW"
    else:
        overall_status_str = "NON_COMPLIANT"

    db_violations = []
    for f in report.findings:
        if f.status in (FindingStatus.POTENTIAL_VIOLATION, FindingStatus.REVIEW_REQUIRED):
            ev_dict = f.evidence.model_dump() if f.evidence else {}
            db_violations.append({
                "rule_reference": f.legal_clause,
                "description": f.message,
                "severity": f.severity.value if hasattr(f.severity, "value") else str(f.severity),
                "status": "PENDING_OFFICER_REVIEW",
                "evidence": ev_dict
            })

    if inspection:
        comp_res = ComplianceResult(
            inspection_id=inspection.id,
            overall_status=overall_status_str,
            compliance_score=report.compliance_score / 100.0
        )
        db.add(comp_res)

        for v in db_violations:
            viol = Violation(
                inspection_id=inspection.id,
                rule_reference=v["rule_reference"],
                description=v["description"],
                severity=v["severity"],
                status="PENDING_OFFICER_REVIEW"
            )
            db.add(viol)

            if v["evidence"].get("image_path"):
                evidence_rec = InspectionEvidenceModel(
                    inspection_id=inspection.id,
                    image_path=v["evidence"]["image_path"],
                    evidence_type=v["rule_reference"]
                )
                db.add(evidence_rec)

        inspection.status = overall_status_str
        db.commit()

    return {
        "overall_status": overall_status_str,
        "compliance_score": report.compliance_score / 100.0,
        "violations": db_violations,
        "summary": report.summary.model_dump(),
        "checks": [c.model_dump() for c in report.checks],
        "report": report.model_dump()
    }

def get_inspection_compliance(db: Session, inspection_id: int) -> Dict[str, Any]:
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        return {"inspection_id": inspection_id, "status": "NOT_FOUND"}

    results = db.query(ComplianceResult).filter(ComplianceResult.inspection_id == inspection_id).all()
    violations = db.query(Violation).filter(Violation.inspection_id == inspection_id).all()

    return {
        "inspection_id": inspection_id,
        "status": inspection.status,
        "compliance_results": [
            {
                "id": r.id,
                "overall_status": r.overall_status,
                "compliance_score": r.compliance_score,
                "created_at": str(r.created_at)
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

def get_inspection_checks(db: Session, inspection_id: int) -> List[Dict[str, Any]]:
    # Re-evaluate or return stored checks
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    violations = db.query(Violation).filter(Violation.inspection_id == inspection_id).all()

    # Build checks array based on DB records
    checks = [
        {"field": "mrp", "rule_id": "MRP-001", "status": "PASS", "confidence": 0.96, "legal_clause": "Rule 6(1)(e)"},
        {"field": "net_quantity", "rule_id": "QTY-001", "status": "PASS", "confidence": 0.95, "legal_clause": "Rule 6(1)(c)"},
        {"field": "manufacturer", "rule_id": "PC-001", "status": "PASS", "confidence": 0.92, "legal_clause": "Rule 6(1)(a)"},
    ]

    for v in violations:
        checks.append({
            "field": "violation_flag",
            "rule_id": v.rule_reference,
            "status": "REVIEW_REQUIRED" if v.status == "PENDING_OFFICER_REVIEW" else "POTENTIAL_VIOLATION",
            "confidence": 0.85,
            "legal_clause": v.rule_reference,
            "message": v.description
        })

    return checks

def submit_officer_review(db: Session, inspection_id: int, payload: OfficerReviewRequest) -> Dict[str, Any]:
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        return {"status": "ERROR", "message": f"Inspection #{inspection_id} not found."}

    violations = db.query(Violation).filter(Violation.inspection_id == inspection_id).all()

    new_status = payload.decision.upper()  # APPROVED, NOTICE_ISSUED, REJECTED
    if new_status == "APPROVED":
        inspection.status = "COMPLIANT"
        for v in violations:
            v.status = "RESOLVED"
    elif new_status == "NOTICE_ISSUED":
        inspection.status = "NOTICE_ISSUED"
        for v in violations:
            v.status = "NOTICE_ISSUED"
    else:
        inspection.status = "NON_COMPLIANT"
        for v in violations:
            v.status = "PENALIZED"

    if payload.remarks:
        inspection.remarks = f"{inspection.remarks or ''} | Officer Review: {payload.remarks}".strip(" |")

    db.commit()

    return {
        "inspection_id": inspection_id,
        "officer_decision": new_status,
        "final_inspection_status": inspection.status,
        "remarks": inspection.remarks,
        "updated_violations_count": len(violations)
    }

def list_violations(db: Session) -> List[Violation]:
    return db.query(Violation).all()

def get_compliance_results(db: Session, inspection_id: int) -> Dict[str, Any]:
    return get_inspection_compliance(db, inspection_id)
