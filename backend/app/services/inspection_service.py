from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.inspection import Inspection
from app.models.user import User
from app.schemas.inspection import GuidedInspectionStart, OfficerVerificationSchema

def ensure_user_exists(db: Session, user_id: str, email: str, full_name: str, role: str = "OFFICER") -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(
            id=user_id,
            email=email,
            hashed_password="no_password",
            full_name=full_name,
            role=role,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def start_guided_inspection(db: Session, payload: GuidedInspectionStart, employee_id: str) -> Dict[str, Any]:
    ensure_user_exists(db, employee_id, f"{employee_id}@officer.com", "Officer User", "OFFICER")
    
    inspection = Inspection(
        employee_id=employee_id,
        product_id=payload.product_id or payload.product_name,
        location=payload.location,
        remarks=payload.remarks,
        status="PENDING",
    )
    db.add(inspection)
    db.commit()
    db.refresh(inspection)

    return {
        "id": inspection.id,
        "session_id": f"SESS-{inspection.id}-2026",
        "product_id": payload.product_id or "PROD-101",
        "product_name": payload.product_name or "ABC Biscuits Premium Pack",
        "category": payload.category or "Packaged Commodities",
        "location": payload.location or "ABC Supermarket, MG Road",
        "officer_id": employee_id,
        "status": "PENDING",
        "step": "analysis",
        "extracted": {
            "product_name": payload.product_name or "ABC Biscuits Premium Pack",
            "mrp": "₹ 150.00",
            "net_quantity": "500 g",
            "manufacturer": "ABC Foods Pvt. Ltd.",
            "consumer_care": "1800-111-2222",
        },
        "evidences": [],
        "created_at": inspection.inspection_date,
    }

def get_guided_inspection_detail(db: Session, inspection_id: str) -> Dict[str, Any]:
    return {
        "id": int(inspection_id) if str(inspection_id).isdigit() else inspection_id,
        "session_id": f"SESS-{inspection_id}-2026",
        "product_id": "PROD-101",
        "product_name": "ABC Biscuits Premium Pack",
        "category": "Packaged Commodities",
        "location": "ABC Supermarket, MG Road",
        "officer_id": "officer-01",
        "status": "UNDER_REVIEW",
        "step": "verification",
        "extracted": {
            "product_name": "ABC Biscuits Premium Pack",
            "mrp": "₹ 150.00",
            "net_quantity": "500 g",
            "manufacturer": "ABC Foods Pvt. Ltd.",
            "consumer_care": "1800-111-2222",
        },
        "evidences": [
            {
                "id": "ev-01",
                "image_url": "/static/scans/sample_label.jpg",
                "label": "Front MRP Label",
                "extracted_text": "MRP RS. 150.00 INCL. OF ALL TAXES",
            }
        ],
        "created_at": "2026-08-31T10:00:00Z",
    }

def verify_and_signoff_inspection(
    db: Session, inspection_id: str, payload: OfficerVerificationSchema
) -> Dict[str, Any]:
    inspection = db.query(Inspection).filter(Inspection.id == (int(inspection_id) if str(inspection_id).isdigit() else 1)).first()
    if inspection:
        inspection.status = payload.override_status or "VERIFIED_COMPLIANT"
        inspection.remarks = payload.officer_notes
        db.commit()

    return {
        "inspection_id": int(inspection_id) if str(inspection_id).isdigit() else inspection_id,
        "status": payload.override_status or "VERIFIED_COMPLIANT",
        "officer_notes": payload.officer_notes,
        "signed_off": True,
    }

def create_inspection(db: Session, payload: GuidedInspectionStart, employee_id: str = "officer-anon") -> Inspection:
    ensure_user_exists(db, employee_id, f"{employee_id}@officer.com", "Officer User", "OFFICER")
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

def list_inspections(db: Session) -> List[Inspection]:
    return db.query(Inspection).order_by(Inspection.inspection_date.desc()).all()
