import io
import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from PIL import Image
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import get_current_user_optional
from app.schemas.scan import (
    InspectionSessionResponse,
    ScanResultResponse,
    ScanResponse,
    ScanListItem,
)
from app.services import scan_service
from app.models.scan import ScanStatusEnum
from app.models.user import User

router = APIRouter(tags=["Scans & Inspections"])

# MVP Image Constraints
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB maximum
MIN_FILE_SIZE_BYTES = 1024              # 1 KB minimum

MIN_IMAGE_WIDTH = 300                   # 300 px minimum width
MIN_IMAGE_HEIGHT = 300                  # 300 px minimum height

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_IMAGE_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/pjpeg",
    "image/x-png",
}

def validate_image_upload(filename: str, content_type: str, contents: bytes) -> str:
    """
    Validates uploaded image against file size, allowed extensions, MIME types,
    binary magic signatures, and minimum dimension requirements for OCR processing.
    """
    # 1. Maximum File Size Validation
    file_size = len(contents) if contents else 0

    if file_size > MAX_FILE_SIZE_BYTES:
        size_mb = round(file_size / (1024 * 1024), 2)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size ({size_mb} MB) exceeds maximum allowed limit of 10 MB.",
        )

    # 2. Extension validation
    _, ext = os.path.splitext(filename or "")
    ext_lower = ext.lower()

    if ext_lower not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Only .jpg, .jpeg, .png, and .webp images are allowed.",
        )

    # 3. MIME type validation
    c_type = (content_type or "").lower()
    if c_type and c_type not in ALLOWED_IMAGE_MIME_TYPES and not c_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported MIME type '{content_type}'. Only image files (JPEG, PNG, WEBP) are allowed.",
        )

    # 4. Minimum File Size Validation
    if file_size < MIN_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size too small ({file_size} bytes). Uploaded file must be at least 1 KB.",
        )

    # 4. Binary magic number signature check
    if contents.startswith(b'%PDF'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PDF files are not allowed. Please upload an image file (.jpg, .jpeg, .png, .webp).",
        )

    if contents.startswith(b'MZ'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Executable files (EXE) are not allowed. Please upload an image file (.jpg, .jpeg, .png, .webp).",
        )

    if contents.startswith(b'PK\x03\x04') or contents.startswith(b'PK\x05\x06'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Archive files (ZIP) are not allowed. Please upload an image file (.jpg, .jpeg, .png, .webp).",
        )

    # Verify image binary header
    is_jpeg = contents.startswith(b'\xff\xd8\xff')
    is_png = contents.startswith(b'\x89PNG\r\n\x1a\n')
    is_webp = contents.startswith(b'RIFF') and len(contents) >= 12 and contents[8:12] == b'WEBP'

    if not (is_jpeg or is_png or is_webp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File binary validation failed. Provided file is not a valid JPEG, PNG, or WEBP image.",
        )

    # 5. Image Dimension Resolution Check via Pillow
    try:
        with Image.open(io.BytesIO(contents)) as img:
            width, height = img.size
            if width < MIN_IMAGE_WIDTH or height < MIN_IMAGE_HEIGHT:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Image resolution ({width}x{height} px) is too low for reliable OCR label analysis. "
                        f"Minimum resolution required: {MIN_IMAGE_WIDTH}x{MIN_IMAGE_HEIGHT} pixels."
                    ),
                )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Corrupt or unparseable image file. Unable to verify image dimensions.",
        )

def generate_unique_filename(user_id: Optional[str], file_ext: str) -> str:
    unique_hex = uuid.uuid4().hex[:8]
    if user_id:
        clean_user = "".join(c for c in user_id if c.isalnum())[:12]
        return f"{clean_user}_scan_{unique_hex}.{file_ext}"
    return f"scan_{unique_hex}.{file_ext}"


@router.post("/scans", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
async def create_scan(
    image: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    user_id = current_user.id if current_user else None

    if not image or not image.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image file payload is missing.",
        )

    contents = await image.read()
    file_size = len(contents)

    file_ext = validate_image_upload(image.filename, image.content_type, contents)

    saved_filename = generate_unique_filename(user_id, file_ext)

    storage_dir = os.path.join("storage", "scans")
    os.makedirs(storage_dir, exist_ok=True)
    file_path = os.path.join(storage_dir, saved_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    image_path = f"/static/scans/{saved_filename}"

    scan_record = scan_service.create_scan_record(
        db=db,
        original_filename=image.filename,
        image_path=image_path,
        file_type=image.content_type or f"image/{file_ext}",
        file_size=file_size,
        user_id=user_id,
        status=ScanStatusEnum.PENDING.value,
    )

    return scan_record


@router.post("/scans/upload", response_model=ScanResultResponse, status_code=status.HTTP_201_CREATED)
@router.post("/inspections/upload", response_model=ScanResultResponse, status_code=status.HTTP_201_CREATED)
async def upload_package_scan(
    image: UploadFile = File(...),
    product_name: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    officer_id: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    effective_user_id = user_id or (current_user.id if current_user else None)

    if not image or not image.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image file payload is missing.",
        )

    contents = await image.read()
    file_size = len(contents)

    file_ext = validate_image_upload(image.filename, image.content_type, contents)

    saved_filename = generate_unique_filename(effective_user_id, file_ext)
    storage_dir = os.path.join("storage", "scans")
    os.makedirs(storage_dir, exist_ok=True)
    file_path = os.path.join(storage_dir, saved_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    image_path = f"/static/scans/{saved_filename}"

    session = scan_service.process_and_save_scan(
        db=db,
        original_filename=image.filename,
        image_path=image_path,
        file_type=image.content_type,
        file_size=file_size,
        user_id=effective_user_id,
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
        user_id=effective_user_id,
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


@router.get("/scans", response_model=List[ScanListItem])
def list_all_scans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    scans = scan_service.list_scans(db, skip=skip, limit=limit)
    return scans


@router.get("/scans/{scan_id}", response_model=ScanResponse)
def get_scan_detail(scan_id: int, db: Session = Depends(get_db)):
    scan = scan_service.get_scan_by_id(db, scan_id=scan_id)
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan with ID '{scan_id}' not found.",
        )
    return scan

@router.delete("/scans/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scan(scan_id: int, db: Session = Depends(get_db)):
    success = scan_service.delete_scan_record(db, scan_id=scan_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan with ID '{scan_id}' not found.",
        )
    return None


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
