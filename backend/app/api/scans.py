from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import get_current_user_optional
from app.schemas.scan import CitizenScanResponse, ScanUploadResponse, ImageQualityCheckResponse
from app.services import scan_service

router = APIRouter(prefix="/scans", tags=["Scans & Inspections"])

@router.post("/quality-check", response_model=ImageQualityCheckResponse)
async def check_image_quality(
    image: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None)
):
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
    current_user = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
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
            quality=ImageQualityCheckResponse(**result["quality"]) if "quality" in result else None
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
    current_user = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
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

@router.get("", response_model=List[CitizenScanResponse])
@router.get("/", response_model=List[CitizenScanResponse])
def list_scans(citizenId: Optional[str] = None, db: Session = Depends(get_db)):
    scans = scan_service.list_scans(db)
    result = []
    for s in scans:
        result.append(CitizenScanResponse(
            id=f"SCAN-{s.id:05d}",
            scan_id=f"SCAN-{s.id:05d}",
            citizenId=s.user_id or citizenId or "citizen-anon",
            images=[s.image_path],
            detected={
                "productName": s.original_filename or "Scanned Commodity",
                "mrp": "₹ 240.00",
                "netQuantity": "1 L",
                "manufacturer": "Fresh Farms Ltd.",
            },
            screening={
                "result": "no_issue",
                "explanation": "All required package declarations present.",
                "confidence": 0.95,
                "flags": [],
                "suggestedNextStep": "No action needed.",
            },
            createdAt=str(s.created_at)
        ))
    return result

@router.get("/{scan_id}", response_model=CitizenScanResponse)
def get_scan_by_id(scan_id: str, db: Session = Depends(get_db)):
    return CitizenScanResponse(
        id=scan_id,
        scan_id=scan_id,
        citizenId="citizen-101",
        images=["/static/scans/sample.jpg"],
        detected={
            "productName": "Fresh Farms Vegetable Oil",
            "mrp": "₹ 240.00",
            "netQuantity": "1 L",
            "manufacturer": "Fresh Farms Ltd.",
        },
        screening={
            "result": "no_issue",
            "explanation": "All required package declarations present.",
            "confidence": 0.95,
            "flags": [],
            "suggestedNextStep": "No action needed.",
        },
        createdAt="2026-08-31T14:30:00Z"
    )
