from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Form
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import get_current_user_optional
from app.schemas.scan import (
    CitizenScanResponse,
    ScanUploadResponse,
    ImageQualityCheckResponse,
    ScanResultResponse,
)
from app.services import scan_service

router = APIRouter(prefix="/scans", tags=["Scans & Inspections"])


def _build_screening(screening_raw: dict) -> dict:
    """
    Build a screening response from raw stored screening_data.
    Handles legacy/incomplete DB rows where screening is empty or partial.
    Returns honest 'not available' values — never invents product data.
    """
    if not screening_raw:
        # No screening data stored — return honest 'not available' state.
        return {
            "result": None,
            "explanation": "Screening results are not available for this scan.",
            "confidence": 0.0,
            "flags": [],
            "suggestedNextStep": "Re-scan the package to generate screening results.",
        }

    # Preserve actual values; fill missing fields with honest defaults.
    return {
        "result": screening_raw.get("result"),
        "explanation": screening_raw.get("explanation") or "No explanation recorded.",
        "confidence": screening_raw.get("confidence") if screening_raw.get("confidence") is not None else 0.0,
        "flags": screening_raw.get("flags") or [],
        "suggestedNextStep": screening_raw.get("suggestedNextStep") or "No next step recorded.",
    }


@router.post("/quality-check", response_model=ImageQualityCheckResponse)
async def check_image_quality(
    image: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
):
    """
    Check image quality before full processing.
    Returns quality assessment without running full OCR.
    """
    upload_file = image or file
    if not upload_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided. Please upload a valid JPG, PNG, or WebP image."
        )

    contents = await upload_file.read()
    quality_result = scan_service.perform_image_quality_check(contents, upload_file.filename or "upload.jpg")
    return ImageQualityCheckResponse(**quality_result)


@router.post("/upload", response_model=ScanUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_package_image(
    image: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
    current_user=Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Upload package image without running full analysis.
    Stores the image and returns basic metadata.
    """
    upload_file = image or file
    if not upload_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided. Please upload a valid JPG, PNG, or WebP image."
        )

    citizen_id = current_user.id if current_user else "citizen-anon"
    contents = await upload_file.read()

    try:
        result = scan_service.upload_package_image(
            db=db,
            contents=contents,
            filename=upload_file.filename or "package.jpg",
            user_id=citizen_id,
        )
        return ScanUploadResponse(
            scan_id=result["scan_id"],
            status=result["status"],
            message=result["message"],
            file_path=result["file_path"],
            quality=ImageQualityCheckResponse(**result["quality"]) if "quality" in result else None,
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err)
        )


@router.post("", response_model=CitizenScanResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=CitizenScanResponse, status_code=status.HTTP_201_CREATED)
async def create_scan_analysis(
    image: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
    current_user=Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Create a new scan with full AI pipeline analysis.
    This is the main endpoint for scanning package labels.
    """
    upload_file = image or file
    if not upload_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided. Please upload a valid JPG, PNG, or WebP image."
        )

    citizen_id = current_user.id if current_user else "citizen-anon"
    contents = await upload_file.read()

    try:
        result = scan_service.execute_scan_pipeline(
            db=db,
            contents=contents,
            filename=upload_file.filename or "upload.jpg",
            user_id=citizen_id,
        )
        return CitizenScanResponse(**result)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err)
        )


# New endpoint for citizen-specific scan with multiple images
@router.post("/analyze", response_model=CitizenScanResponse, status_code=status.HTTP_201_CREATED)
async def analyze_scan(
    citizenId: Optional[str] = Form(None),
    images: List[UploadFile] = File(None),
    current_user=Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Analyze a scan using AI pipeline.
    Accepts one or more images and returns complete analysis.
    """
    if not images or len(images) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No images provided for analysis."
        )

    effective_user_id = citizenId or (current_user.id if current_user else "citizen-anon")

    # Process the first image through the AI pipeline
    upload_file = images[0]
    contents = await upload_file.read()

    try:
        result = scan_service.execute_scan_pipeline(
            db=db,
            contents=contents,
            filename=upload_file.filename or "scan.jpg",
            user_id=effective_user_id,
        )
        return CitizenScanResponse(**result)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err)
        )


@router.get("", response_model=List[CitizenScanResponse])
@router.get("/", response_model=List[CitizenScanResponse])
def list_scans(citizenId: Optional[str] = None, db: Session = Depends(get_db)):
    """List all scans for a citizen - returns REAL data from database."""
    scans = scan_service.list_scans(db)
    result = []
    for s in scans:
        # Return ONLY real data stored from the actual scan - NO mock/fallback data
        detected = s.detected_data if s.detected_data else {}
        screening_raw = s.screening_data if s.screening_data else {}
        screening = _build_screening(screening_raw)
        result.append(CitizenScanResponse(
            id=f"SCAN-{s.id:05d}",
            scan_id=f"SCAN-{s.id:05d}",
            citizenId=s.user_id or citizenId or "citizen-anon",
            images=[s.image_path] if s.image_path else [],
            detected=detected,
            screening=screening,
            createdAt=str(s.created_at) if s.created_at else None
        ))
    return result


@router.get("/{scan_id}", response_model=CitizenScanResponse)
def get_scan_by_id(scan_id: str, db: Session = Depends(get_db)):
    """Get a specific scan by ID - returns REAL data from database."""
    # Extract numeric ID from scan_id format "SCAN-00001"
    try:
        if scan_id.startswith("SCAN-"):
            numeric_id = int(scan_id.replace("SCAN-", ""))
        else:
            numeric_id = int(scan_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid scan ID format: {scan_id}"
        )

    scan = scan_service.get_scan_by_id(db, numeric_id)
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan with ID '{scan_id}' not found."
        )

    # Return ONLY real data from this specific scan
    detected = scan.detected_data if scan.detected_data else {}
    screening = _build_screening(scan.screening_data if scan.screening_data else {})

    return CitizenScanResponse(
        id=scan_id,
        scan_id=scan_id,
        citizenId=scan.user_id or "citizen-anon",
        images=[scan.image_path] if scan.image_path else [],
        detected=detected,
        screening=screening,
        createdAt=str(scan.created_at) if scan.created_at else None
    )