import os
import sys
import uuid
from pathlib import Path
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

# Ensure project root is in sys.path
root_dir = str(Path(__file__).resolve().parents[3])
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from app.database.session import get_db
from app.core.deps import get_current_user_optional
from app.models.user import User
from app.services import scan_service
from ai import AIInferencePipeline

router = APIRouter(prefix="/ai", tags=["AI & OCR Engine"])

pipeline = AIInferencePipeline()

# Prototype upload storage directory (configurable for S3 / Azure Blob / GCS / MinIO)
UPLOAD_STORAGE_DIR = os.path.join("backend", "uploads")
os.makedirs(UPLOAD_STORAGE_DIR, exist_ok=True)

@router.post("/scan", status_code=status.HTTP_200_OK)
async def ai_scan_package_image(
    file: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    POST /api/v1/ai/scan
    Stage 6.2: Upload package image (stores in backend/uploads/)
    Stage 6.3: Run Image Quality Gate (blur, brightness, resolution, text visibility)
    Stage 6.4: Multi-Engine OCR & Structured Declaration Extraction
    """
    upload_file = file or image
    if not upload_file or not upload_file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Package image payload missing. Please upload a valid image file.",
        )

    contents = await upload_file.read()
    if not contents or len(contents) < 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty or too small (min 1 KB).",
        )

    # 1. Save original image into backend/uploads/
    _, ext = os.path.splitext(upload_file.filename or "")
    ext_lower = ext.lower() if ext else ".jpg"
    unique_id = uuid.uuid4().hex[:8]
    user_prefix = current_user.id if current_user else "emp_anon"
    saved_filename = f"{user_prefix}_upload_{unique_id}{ext_lower}"
    file_path = os.path.join(UPLOAD_STORAGE_DIR, saved_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    # 2. Stage 6.3 & 6.4 AI Inference Execution
    try:
        inference_result = pipeline.process_image(contents, saved_filename, scan_id=f"SCAN-{unique_id}")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"AI Processing failed: {str(e)}"
        )

    # If Stage 6.3 Image Quality Gate fails, return rejection feedback
    if not inference_result.quality.usable:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "status": "QUALITY_REJECTED",
                "message": inference_result.quality.feedback,
                "defects": inference_result.quality.defects,
                "quality_score": inference_result.quality.quality_score
            }
        )

    # 3. Phase 7 Rule Engine Evaluation
    declarations_dict = inference_result.declarations.model_dump()
    rule_results = scan_service.run_legal_metrology_rule_engine(declarations_dict)

    return {
        "status": "SUCCESS",
        "scan_id": inference_result.scan_id,
        "image_path": f"/uploads/{saved_filename}",
        "dimensions": inference_result.dimensions,
        "quality": inference_result.quality.model_dump(),
        "extracted_declarations": declarations_dict,
        "field_evidences": [e.model_dump() for e in inference_result.field_evidences],
        "rule_engine_screening": rule_results
    }
