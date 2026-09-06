# AI Pipeline — Real Implementation

Replaces the demo/placeholder AI response with an actual working pipeline:
**image → preprocessing → OCR → field extraction → structured declarations**,
used identically by camera capture and file upload.

Verified end-to-end in this delivery: 13/13 automated tests pass
(`pytest ai/tests -v`), plus manual HTTP tests against both endpoints via
FastAPI's `TestClient` (real OCR run on a synthetic label, real detect-package
run on real pixel data — see test output notes below).

## Install

```bash
# System dependency — the actual OCR engine
sudo apt-get install -y tesseract-ocr tesseract-ocr-eng

# Python dependencies
pip install -r ai/requirements.txt
```

## Run the API

```bash
uvicorn backend.app.main:app --reload --port 8000
```

## Endpoints

### `POST /api/v1/ai/scan` — the real pipeline (Part B)

Used by **both** camera capture and file upload — same endpoint, same code path,
no branch anywhere that returns fixed values.

```bash
curl -X POST http://localhost:8000/api/v1/ai/scan \
  -F "image=@label.jpg;type=image/jpeg" \
  -F "source=upload"        # or "source=camera" — metadata only, doesn't change processing
```

Returns an `AIResult` (see `ai/schemas/ai_result.py`): every declaration field
(`product_name`, `mrp`, `net_quantity`, `manufacturer`, `packing_date`,
`consumer_care`, `country_of_origin`, `unit_sale_price`) comes back as
`{ value, confidence, raw_match, source_line }`. If OCR finds nothing, `value`
is `null` and `confidence` is `"not_found"` — there is no fallback to a
plausible-looking fake product.

### `POST /api/v1/ai/detect-package` — lightweight live-camera check (Part A)

Call this every ~200–300ms while the camera view is open, **not** on every
single frame and **without** running OCR. It's classical edge/contour analysis
on a downscaled frame, cheap enough to poll continuously:

```bash
curl -X POST http://localhost:8000/api/v1/ai/detect-package \
  -F "frame=@current_frame.jpg;type=image/jpeg"
```

```json
{ "detected": true, "confidence": 0.82, "bbox": {"x":120,"y":80,"width":400,"height":300}, "message": "Package detected — ready to capture." }
```

Frontend flow this enables (per your Part A diagram):

```
Camera frames → detect-package (every ~250ms, no OCR)
  → detected=false → show "Show package inside frame" / disable Capture
  → detected=true  → draw bbox overlay, enable Capture button
       → user taps Capture → send THAT ONE frame to /scan → full pipeline runs once
```

## Folder layout (matches your Phase 6 structure)

```
ai/
├── inference.py                    AIInferencePipeline — the single real code path
├── ocr/
│   ├── ocr_engine.py                pytesseract wrapper — actual OCR, word boxes + confidence
│   └── text_recognizer.py           groups OCR words into clean lines, filters noise
├── image_processing/
│   ├── preprocessing.py             decode, upscale, denoise, deskew, binarize
│   ├── quality_check.py             real blur/brightness/resolution scoring
│   └── perspective.py               finds the label quad, warps to top-down view
├── detection/
│   ├── package_detector.py          Part A: cheap per-frame live detector (no OCR)
│   └── declaration_detector.py      finds text-dense candidate declaration panels
├── extraction/
│   ├── declaration_extractor.py     orchestrates every parser below
│   ├── mrp_parser.py
│   ├── quantity_parser.py
│   ├── date_parser.py
│   ├── manufacturer_parser.py
│   └── consumer_care_parser.py
└── schemas/
    └── ai_result.py                 Pydantic models for every response shape

backend/app/api/v1/ai.py             FastAPI router: /scan, /detect-package, /health
backend/app/main.py                  minimal app entry point (merge into your real app)
```

## What "real" means here, concretely

- **No cached/fixed return values anywhere.** Grep the codebase for a demo
  product name or a hardcoded MRP — there isn't one. `test_no_hardcoded_fallback_on_blank_image`
  asserts a blank image returns `not_found` on every field, not a fake product.
- **Quality gating is computed, not asserted.** Blur = Laplacian variance;
  brightness = mean pixel intensity; both have real thresholds and get
  surfaced as human-readable `issues` so the officer knows *why* to retake a shot.
- **Package detection is classical CV, not a stub.** Edge detection → largest
  contour → rectangularity + frame-coverage scoring. It's intentionally not a
  trained model (no GPU/training data in scope here) but it's genuinely
  evaluating each frame's pixels, not returning `True`.
- **Every extractor is a real regex/heuristic parser** tested against varied
  input phrasing (e.g. `date_parser` handles both `07/2026` and `JUL 2026`).

## Known limitations (be upfront about these with your team/judges)

- **Package/declaration detection is classical CV, not deep learning.** It
  works well for a package that clearly dominates the frame against a plainer
  background, and is intentionally cheap enough to poll every frame. A
  YOLO/SSD-based detector would be more robust to cluttered backgrounds —
  swap it in behind the same `detect_package_live()` function signature later.
- **Manufacturer extraction is heuristic**, not NER. It works well when the
  label uses a standard "Manufactured by: ..." / "Marketed by: ..." phrasing
  (the near-universal norm on Indian packaging) but can miss unusual layouts.
- **OCR quality depends on Tesseract**, which is solid for printed Latin-script
  text but weaker on stylized fonts, curved surfaces, or dense regional-language
  text. Swapping in EasyOCR/PaddleOCR behind `ai/ocr/ocr_engine.py`'s
  `run_ocr()` signature is a drop-in future upgrade.

## Wiring into your existing FastAPI app

If you already have a `backend/app` with its own `main.py`, you only need:

```python
from backend.app.api.v1.ai import router as ai_router
app.include_router(ai_router)
```

Everything else (`ai/*`) is self-contained and has no dependency on the rest of
your backend.
