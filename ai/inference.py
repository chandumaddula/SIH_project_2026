from typing import Dict, Any, Optional
from ai.schemas.ai_result import AIInferenceResult
from ai.image_processing.quality_check import perform_image_quality_check
from ai.image_processing.preprocessing import preprocess_image
from ai.image_processing.perspective import correct_perspective
from ai.ocr.ocr_engine import OCREngine
from ai.extraction.declaration_extractor import extract_all_declarations

class AIInferencePipeline:
    """
    End-to-End AI + OCR Pipeline Entrypoint.
    Executes Image Quality Check -> Preprocessing -> Perspective Correction ->
    Multi-Engine OCR -> Declaration Parsing -> Structured AI Inferences with BBox Evidence.
    """
    def __init__(self):
        self.ocr_engine = OCREngine()

    def process_image(self, contents: bytes, filename: str, scan_id: Optional[str] = None) -> AIInferenceResult:
        # 1. Quality Check
        quality = perform_image_quality_check(contents, filename)

        # 2. Preprocessing & Perspective Correction
        img, meta = preprocess_image(contents)
        cropped_pdp, perspective_meta = correct_perspective(img)

        # 3. OCR Engine Extraction
        ocr_result = self.ocr_engine.extract_text(cropped_pdp)

        # 4. Structured Declaration Parsing with Field Evidence & Bounding Boxes
        declarations, field_evidences = extract_all_declarations(
            ocr_result["raw_text"],
            ocr_result["bounding_boxes"]
        )

        return AIInferenceResult(
            scan_id=scan_id or "SCAN-DEMO-001",
            image_path=f"/static/scans/{filename}",
            dimensions=meta["processed_dimensions"],
            quality=quality,
            raw_text=ocr_result["raw_text"],
            bounding_boxes=ocr_result["bounding_boxes"],
            declarations=declarations,
            field_evidences=field_evidences
        )
