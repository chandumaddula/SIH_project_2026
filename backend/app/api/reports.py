from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.inspection import Inspection, ComplianceResult, Violation
from app.models.complaint import Complaint
from app.models.product import Product

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/summary")
def get_summary_report(db: Session = Depends(get_db)):
    total_products = db.query(Product).count()
    total_inspections = db.query(Inspection).count()
    total_complaints = db.query(Complaint).count()
    total_violations = db.query(Violation).count()

    compliant_count = db.query(Inspection).filter(Inspection.status == "COMPLIANT").count()
    non_compliant_count = db.query(Inspection).filter(Inspection.status == "NON_COMPLIANT").count()

    compliance_rate = (compliant_count / total_inspections * 100) if total_inspections > 0 else 100.0

    return {
        "total_products": total_products,
        "total_inspections": total_inspections,
        "total_complaints": total_complaints,
        "total_violations": total_violations,
        "compliant_inspections": compliant_count,
        "non_compliant_inspections": non_compliant_count,
        "compliance_rate_percentage": round(compliance_rate, 2),
    }

@router.get("/inspection/{inspection_id}")
def get_inspection_report(inspection_id: int, db: Session = Depends(get_db)):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection report not found"
        )
    
    compliance = db.query(ComplianceResult).filter(ComplianceResult.inspection_id == inspection_id).first()
    violations = db.query(Violation).filter(Violation.inspection_id == inspection_id).all()

    return {
        "inspection_id": inspection.id,
        "employee_id": inspection.employee_id,
        "product_id": inspection.product_id,
        "status": inspection.status,
        "location": inspection.location,
        "inspection_date": inspection.inspection_date,
        "compliance_score": compliance.compliance_score if compliance else None,
        "violations_count": len(violations),
        "violations": [
            {
                "rule_reference": v.rule_reference,
                "description": v.description,
                "severity": v.severity,
                "status": v.status
            }
            for v in violations
        ]
    }
