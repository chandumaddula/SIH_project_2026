import random
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.scan import (
    Scan,
    InspectionSession,
    InspectionEvidence,
    RuleViolation,
    ComplianceStatusEnum,
    RuleSeverityEnum,
    ScanStatusEnum,
)

def list_sessions(db: Session, skip: int = 0, limit: int = 100) -> List[InspectionSession]:
    return db.query(InspectionSession).order_by(InspectionSession.created_at.desc()).offset(skip).limit(limit).all()

def get_session_by_id(db: Session, session_id: str) -> Optional[InspectionSession]:
    return db.query(InspectionSession).filter(InspectionSession.id == session_id).first()

def list_scans(db: Session, skip: int = 0, limit: int = 100) -> List[Scan]:
    return db.query(Scan).order_by(Scan.created_at.desc()).offset(skip).limit(limit).all()

def process_and_save_scan(
    db: Session,
    original_filename: str,
    image_path: str,
    file_type: str,
    file_size: int,
    user_id: Optional[str] = None,
    product_name: Optional[str] = None,
    category: Optional[str] = None,
    officer_id: Optional[str] = None,
) -> InspectionSession:
    # 1. Create Scan Record in `scans` table
    scan_record = Scan(
        user_id=user_id,
        image_path=image_path,
        original_filename=original_filename,
        file_type=file_type,
        file_size=file_size,
        status=ScanStatusEnum.COMPLETED.value,
    )
    db.add(scan_record)
    db.commit()
    db.refresh(scan_record)

    session_id = f"SES-2026-{random.randint(100, 999)}"

    # 2. OCR Extraction Simulation
    sample_text = (
        f"MRP Rs 149.00 (Incl. of all taxes) | Net Qty: 250 g | Mfd Date: 08/2026 | "
        f"Packed by: National Foods Ltd, Plot 42, Industrial Zone | Customer Care: care@nationalfoods.in"
    )

    is_compliant = random.choice([True, True, False])
    compliance_status = ComplianceStatusEnum.COMPLIANT if is_compliant else ComplianceStatusEnum.NON_COMPLIANT

    bounding_boxes = [
        {
            "x": 14,
            "y": 18,
            "width": 45,
            "height": 12,
            "label": "MRP Declaration",
            "text": "MRP Rs 149.00 (Incl. of all taxes)",
            "confidence": 0.97,
            "isCompliant": True,
        },
        {
            "x": 14,
            "y": 35,
            "width": 30,
            "height": 10,
            "label": "Net Quantity",
            "text": "Net Qty: 250 g",
            "confidence": 0.94,
            "isCompliant": True,
        },
        {
            "x": 52,
            "y": 18,
            "width": 35,
            "height": 10,
            "label": "Mfg / Packing Date",
            "text": "Mfd Date: 08/2026",
            "confidence": 0.91,
            "isCompliant": True,
        },
        {
            "x": 14,
            "y": 52,
            "width": 72,
            "height": 22,
            "label": "Manufacturer / Packer",
            "text": "Packed by: National Foods Ltd",
            "confidence": 0.93,
            "isCompliant": is_compliant,
        },
        {
            "x": 14,
            "y": 78,
            "width": 60,
            "height": 10,
            "label": "Consumer Helpline",
            "text": "Customer Care: care@nationalfoods.in",
            "confidence": 0.95,
            "isCompliant": True,
        },
    ]

    # 3. Create Session Record
    session = InspectionSession(
        id=session_id,
        officer_id=officer_id,
        scan_id=scan_record.id,
        product_name=product_name or original_filename or "Scanned Commodity Package",
        category=category or "General Packaged Commodity",
        compliance_status=compliance_status.value,
    )
    db.add(session)
    db.commit()

    # 4. Create Evidence Record
    evidence = InspectionEvidence(
        session_id=session_id,
        image_url=image_path,
        bounding_box_json=bounding_boxes,
        extracted_text=sample_text,
    )
    db.add(evidence)

    # 5. Create Violations if Non-Compliant
    if not is_compliant:
        violation = RuleViolation(
            session_id=session_id,
            rule_id="PCR-2011-RULE-6-1-A",
            severity=RuleSeverityEnum.HIGH.value,
            description="Complete Manufacturer/Packer postal address is missing or truncated on package label.",
            legal_reference="Legal Metrology (Packaged Commodities) Rules 2011, Rule 6(1)(a)",
        )
        db.add(violation)

    db.commit()
    db.refresh(session)
    return session
