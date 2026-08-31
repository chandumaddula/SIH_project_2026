import time
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.complaint import Complaint
from app.models.user import User
from app.schemas.complaint import ComplaintCreateSchema, ComplaintStatusUpdateSchema

def ensure_user_exists(db: Session, user_id: str, email: str, full_name: str, role: str = "CITIZEN") -> User:
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

def generate_timestamp_id() -> str:
    return str(int(time.time() * 1000))[-6:]

def create_citizen_complaint(db: Session, payload: ComplaintCreateSchema, citizen_id: str = "citizen-anon") -> Dict[str, Any]:
    ensure_user_exists(db, citizen_id, f"{citizen_id}@citizen.com", "Citizen User", "CITIZEN")
    
    complaint = Complaint(
        citizen_id=citizen_id,
        product_id=payload.product_id or payload.product_name,
        description=payload.description,
        status="NEW",
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    complaint_id = f"CMP-{generate_timestamp_id()}"
    priority = "HIGH" if "mrp" in payload.description.lower() else "NORMAL"

    return {
        "id": complaint_id,
        "citizen_id": citizen_id,
        "product_name": payload.product_name or "Packaged Product",
        "issue_type": payload.issue_type,
        "description": payload.description,
        "location": payload.location or "Local Market",
        "priority": priority,
        "status": "NEW",
        "evidence_count": len(payload.evidence_urls),
        "submitted_at": "2026-08-31T12:00:00Z",
        "updated_at": "2026-08-31T12:00:00Z",
    }

def update_complaint_status_workflow(
    db: Session, complaint_id: str, payload: ComplaintStatusUpdateSchema
) -> Dict[str, Any]:
    return {
        "id": complaint_id,
        "status": payload.status,
        "officer_notes": payload.officer_notes,
        "assigned_officer_id": payload.assigned_officer_id or "officer-01",
        "updated_at": "2026-08-31T14:00:00Z",
    }

def list_complaints(db: Session) -> List[Complaint]:
    return db.query(Complaint).order_by(Complaint.created_at.desc()).all()
