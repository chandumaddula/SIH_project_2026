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

# Use the real ai_flow pipeline (full image→OCR→extraction→rule-engine flow)
# This replaces the previous demo AIInferencePipeline that returned hardcoded data.
try:
    from ai_flow.pipeline.scan_pipeline import run_pipeline as run_ai_flow_pipeline
    AI_FLOW_AVAILABLE = True
except ImportError as e:  # pragma: no cover
    AI_FLOW_AVAILABLE = False
    AI_FLOW_IMPORT_ERROR = str(e)

router = APIRouter(prefix="/ai", tags=["AI & OCR Engine"])

# Prototype upload storage directory
UPLOAD_STORAGE_DIR = os.path.join("backend", "uploads")
os.makedirs(UPLOAD_STORAGE_DIR, exist_ok=True)


@router.get("/health")
def ai_health():
    """Health check for the AI pipeline."""
    return {
        "status": "online" if AI_FLOW_AVAILABLE else "degraded",
        "ai_flow_pipeline": AI_FLOW_AVAILABLE,
        "ocr_engine": "paddleocr" if AI_FLOW_AVAILABLE else "unavailable",
    }


@router.post("/scan", status_code=status.HTTP_200_OK)
async def ai_scan_package_image(
    file: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    POST /api/v1/ai/scan

    Real-time AI pipeline for package image analysis:
    📷 Package Image → 🌐 Backend → 🤖 AI Pipeline → 🔎 OCR → 📋 Field Extraction → ⚖️ Rule Engine → 🟡 Review Recommended

    Accepts both camera captures and file uploads through the same code path.
    Returns the actually extracted fields from OCR — no hardcoded fallback data.
    """
    if not AI_FLOW_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI pipeline unavailable: {AI_FLOW_IMPORT_ERROR}",
        )

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

    # Save original image into backend/uploads/
    _, ext = os.path.splitext(upload_file.filename or "")
    ext_lower = ext.lower() if ext else ".jpg"
    unique_id = uuid.uuid4().hex[:8]
    user_prefix = current_user.id if current_user else "emp_anon"
    saved_filename = f"{user_prefix}_upload_{unique_id}{ext_lower}"
    file_path = os.path.join(UPLOAD_STORAGE_DIR, saved_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Run the real ai_flow pipeline
    scan_id = f"SCAN-{unique_id}"
    try:
        scan_result = run_ai_flow_pipeline(image_bytes=contents, scan_id=scan_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"AI Processing failed: {str(e)}",
        )

    # Convert the ai_flow ScanResponse to the rule-engine's expected format
    fields = scan_result.fields or {}
    declarations = _fields_to_declarations(fields)

    # If image quality is unusable AND OCR returned no text, surface a rejection
    ocr_text = " ".join(item.text for item in scan_result.ocr).strip()
    if not scan_result.image_quality.usable and not ocr_text:
        return {
            "status": "QUALITY_REJECTED",
            "scan_id": scan_id,
            "image_path": f"/uploads/{saved_filename}",
            "message": scan_result.image_quality.warnings or [
                "Image quality is too low for reliable OCR."
            ],
            "defects": scan_result.image_quality.defects,
            "quality_score": scan_result.image_quality.quality_score,
        }

    # Run the rule engine on the actually extracted data
    try:
        rule_results = scan_service.run_legal_metrology_rule_engine(declarations)
    except Exception as e:
        # Surface the engine error but still return what OCR produced
        rule_results = {
            "result": "review_recommended",
            "compliance_status": "NEEDS_REVIEW",
            "explanation": f"Rule engine failed: {e}",
            "confidence": 0.0,
            "flags": [],
            "violations": [],
            "suggestedNextStep": "Manual review required",
        }

    # Build the field-evidence list (one per extracted field)
    field_evidences = []
    for fname, fdata in fields.items():
        if not isinstance(fdata, dict):
            continue
        val = fdata.get("value")
        if val is None:
            continue
        field_evidences.append({
            "field": fname,
            "value": val,
            "confidence": fdata.get("confidence", 0.0),
            "bbox": fdata.get("bbox"),
            "source_text": fdata.get("source_text"),
        })

    return {
        "status": "SUCCESS",
        "scan_id": scan_id,
        "image_path": f"/uploads/{saved_filename}",
        "image_quality": scan_result.image_quality.model_dump(),
        "package_detection": scan_result.package_detection.model_dump(),
        "extracted_declarations": declarations,
        "ocr_text": [item.model_dump() for item in scan_result.ocr],
        "raw_text": " ".join(item.text for item in scan_result.ocr),
        "field_evidences": field_evidences,
        "rule_engine_screening": rule_results,
        "warnings": scan_result.warnings,
        "errors": scan_result.errors,
    }


def _fields_to_declarations(fields: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert ai_flow FieldExtractor output to the format expected by
    scan_service.run_legal_metrology_rule_engine (camelCase + 'MRP Rs.' style values).
    """
    declarations: Dict[str, Any] = {}

    if "mrp" in fields and fields["mrp"].get("value") is not None:
        mrp_val = fields["mrp"]["value"]
        declarations["mrp"] = f"MRP Rs. {mrp_val:.2f} (Incl. of all taxes)"
        declarations["MRP"] = declarations["mrp"]
        declarations["mrpValue"] = mrp_val

    if "net_quantity" in fields and fields["net_quantity"].get("value") is not None:
        qty = fields["net_quantity"]["value"]
        unit = fields["net_quantity"].get("unit", "g")
        declarations["netQuantity"] = f"{qty} {unit}"
        declarations["NET_QUANTITY"] = declarations["netQuantity"]
        declarations["netQuantityValue"] = qty
        declarations["netQuantityUnit"] = unit

    for src, dest_camel, dest_pascal in [
        ("manufacturer", "manufacturer", "MANUFACTURER_DETAILS"),
        ("packer", "packer", "PACKER_DETAILS"),
        ("importer", "importer", "IMPORTER_DETAILS"),
        ("consumer_care", "consumerCare", "CONSUMER_CARE"),
        ("country_of_origin", "countryOfOrigin", "COUNTRY_OF_ORIGIN"),
        ("address", "address", "ADDRESS"),
        ("product_name", "productName", "PRODUCT_NAME"),
        ("manufacturing_date", "mfgDate", "MFG_DATE"),
        ("expiry_date", "expDate", "EXP_DATE"),
        ("batch_number", "batchNumber", "BATCH_NUMBER"),
        ("barcode", "barcode", "BARCODE"),
        ("fssai_license", "fssaiLicense", "FSSAI_LICENSE"),
    ]:
        if src in fields and fields[src].get("value") is not None:
            declarations[dest_camel] = str(fields[src]["value"])
            declarations[dest_pascal] = str(fields[src]["value"])

    return declarations
