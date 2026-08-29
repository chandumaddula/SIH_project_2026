import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.scan import InspectionSessionResponse, ScanResultResponse, ScanResponse
from app.services import scan_service
from app.models.scan import Scan

router = APIRouter(tags=["Scans & Inspections"])

@router.post("/scans/upload", response_model=ScanResultResponse, status_code=status.HTTP_201_CREATED)
@router.post("/inspections/upload", response_model=ScanResultResponse, status_code=status.HTTP_201_CREATED)
async def upload_package_scan(
    image: UploadFile = File(...),
    product_name: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    officer_id: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    if not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File provided must be an image (JPEG, PNG, WEBP).",
        )

    file_ext = image.filename.split(".")[-1] if "." in image.filename else "jpg"
    saved_filename = f"scan_{uuid.uuid4().hex[:10]}.{file_ext}"
    storage_dir = os.path.join("storage", "scans")
    os.makedirs(storage_dir, exist_ok=True)
    file_path = os.path.join(storage_dir, saved_filename)

    # Read binary contents and calculate file size
    contents = await image.read()
    file_size = len(contents)

    with open(file_path, "wb") as f:
        f.write(contents)

    image_path = f"/static/scans/{saved_filename}"

    session = scan_service.process_and_save_scan(
        db=db,
        original_filename=image.filename,
        image_path=image_path,
        file_type=image.content_type,
        file_size=file_size,
        user_id=user_id,
        product_name=product_name,
        category=category,
        officer_id=officer_id,
    )

    evidence = session.evidences[0] if session.evidences else None
    violations = session.violations
    scan_response = ScanResponse.model_validate(session.scan) if session.scan else ScanResponse(
        id=1,
        image_path=image_path,
        original_filename=image.filename,
        file_type=image.content_type,
        file_size=file_size,
        user_id=user_id,
        status="COMPLETED",
        created_at=session.created_at,
        updated_at=session.created_at
    )

    return ScanResultResponse(
        scan=scan_response,
        session=InspectionSessionResponse.model_validate(session),
        evidence=evidence,
        violations=violations,
    )

@router.get("/scans", response_model=List[ScanResponse])
def list_all_scans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    scans = scan_service.list_scans(db, skip=skip, limit=limit)
    return scans

@router.get("/scans/sessions", response_model=List[InspectionSessionResponse])
@router.get("/inspections/sessions", response_model=List[InspectionSessionResponse])
def get_inspection_sessions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    sessions = scan_service.list_sessions(db, skip=skip, limit=limit)
    return sessions

@router.get("/scans/sessions/{session_id}", response_model=InspectionSessionResponse)
@router.get("/inspections/sessions/{session_id}", response_model=InspectionSessionResponse)
def get_inspection_session_detail(session_id: str, db: Session = Depends(get_db)):
    session = scan_service.get_session_by_id(db, session_id=session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection session '{session_id}' not found.",
        )
    return session
