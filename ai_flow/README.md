# AI Flow Package - Real OCR and Field Extraction Pipeline

This package implements the real AI pipeline for legal metrology compliance scanning,
replacing the mock OCR and extraction functionality.

## Overview

AI Flow provides:

- Real OCR using EasyOCR engine
- Advanced image preprocessing (deskewing, contrast enhancement, sharpening)
- Package detection to identify package regions
- Field extraction for legal metrology compliance
- Evidence mapping with bounding boxes
- Full pipeline integration with the existing backend

## Installation

```bash
cd ai_flow
pip install -r requirements.txt
```

## Dependencies

See `requirements.txt` for full dependency list.

## Quick Start

1. Initialize EasyOCR (first call is slower):
```python
from ai_flow.ocr.ocr_engine import OCR
ocr = OCR()
```

2. Run full pipeline:
```python
from ai_flow.pipeline.scan_pipeline import AIFieldExtractionPipeline

pipeline = AIFieldExtractionPipeline()
result = pipeline.process_image("path/to/image.jpg")
```

3. Extract fields from OCR results:
```python
from ai_flow.extraction.field_extractor import FieldExtractor

extractor = FieldExtractor()
fields = extractor.extract_from_ocr(ocr_result)
```

## Pipeline Components

### 1. Image Preprocessing
File: `ai_flow/preprocessing/image_preprocessor.py`
- Image quality validation
- Deskewing and orientation correction
- Contrast and brightness enhancement
- Sharpening and noise reduction
- Minimum resolution checking

### 2. Package Detection
File: `ai_flow/detection/package_detector.py`
- Lightweight package/label detection
- Region of interest identification
- Focus on legal metrology labels

### 3. OCR Engine
File: `ai_flow/ocr/ocr_engine.py`
- EasyOCR-based text detection and recognition
- Multi-language support (English)
- Confidence scoring
- Bounding box extraction

### 4. Field Extraction
File: `ai_flow/extraction/field_extractor.py`
- Structured field extraction from OCR results
- Legal metrology field mapping
- Evidence preservation (confidence, source text, bbox)

### 5. Schemas
File: `ai_flow/schemas/result.py`
- Pydantic models for API responses
- Validation and serialization

### 6. Main Pipeline
File: `ai_flow/pipeline/scan_pipeline.py`
- Orchestrates all pipeline components
- Clean stage separation
- Testable independent components

## Integration with Existing Backend

The AI Flow pipeline integrates with:

- `SIH_project_2026/backend/app/services/scan_service.py`
- `SIH_project_2026/backend/app/services/ocr_service.py`
- `SIH_project_2026/backend/app/api/v1/scans.py`

Replace mock functions with real AI pipeline calls.

## Testing

Run the test suite:
```bash
pytest tests/
```

## Performance Notes

- EasyOCR supports multiple languages but English is optimized
- First OCR initialization takes ~1-2 minutes (cached thereafter)
- Preprocessing is performed before OCR for better accuracy
- Package detection can skip OCR on non-package images

## Limitations

- Requires GPU for optimal EasyOCR performance (optional)
- Processing time depends on image complexity
- May need preprocessing adjustments for specific label formats
- Some edge cases may still be challenging

## Future Enhancements

- PaddleOCR integration as alternative
- Model fine-tuning for legal metrology labels
- Real-time OCR optimization for mobile
- Additional regulatory field support
- Confidence-based quality scoring

## Support

For issues and questions, refer to the architecture documentation in the parent project.
