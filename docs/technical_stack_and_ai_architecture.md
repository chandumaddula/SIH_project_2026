# Legal Metrology AI Platform — AI Architecture & Technical Stack Specification

## Executive Summary

The Legal Metrology AI Compliance Platform is an automated end-to-end computer vision, OCR (Optical Character Recognition), structured data extraction, and statutory legal compliance engine. It is designed to inspect physical product packaging images (from live camera streams or file uploads) and evaluate compliance against the **Legal Metrology (Packaged Commodities) Rules, 2011**.

---

## 1. AI & Computer Vision Pipeline Architecture

```
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│  Live Camera Stream     │ ───► │ 1. Package Detection    │ ───► │  User Taps Capture      │
│  (Per-frame evaluation) │      │  (Classical Edge/Contour)│      │  (Locks target frame)   │
└─────────────────────────┘      └─────────────────────────┘      └───────────┬─────────────┘
                                                                              │
┌─────────────────────────┐      ┌─────────────────────────┐      ┌───────────▼─────────────┐
│ 4. Structured Extraction│ ◄─── │ 3. Multi-Engine OCR     │ ◄─── │ 2. Quality Check &      │
│ (Regex & Heuristics)    │      │ (PaddleOCR / EasyOCR)   │      │    Preprocessing        │
└────────────┬────────────┘      └─────────────────────────┘      └─────────────────────────┘
             │
┌────────────▼────────────┐      ┌─────────────────────────┐
│ 5. Compliance Engine    │ ───► │  Visual Evidence &      │
│ (Rule Engine & Audit)   │      │  Officer Audit Trail    │
└─────────────────────────┘      └─────────────────────────┘
```

### Stage A: Live Camera Edge & Package Detection
- **Files**: `ai/detection/package_detector.py` | `ai_flow/detection/package_detector.py`
- **Endpoint**: `POST /api/v1/ai/detect-package`
- **Purpose**: Evaluates live video frames continuously (every ~200–300ms) without running heavy OCR.
- **Algorithm**:
  1. Downscales camera frame (`cv2.resize` to max 480px width) for execution under 15ms.
  2. Converts to grayscale, applies a $5\times 5$ Gaussian blur, runs Canny edge detection, and dilates edges (`cv2.dilate`).
  3. Evaluates contours against frame coverage ratio ($15\% \le \text{ratio} \le 95\%$) and rectangularity score ($\ge 0.55$).
  4. Returns `detected: true/false`, bounding box coordinates, and visual guidance messages (*"Move closer"*, *"Step back"*, or *"Package detected — ready to capture"*).

---

### Stage B1: Quality Check & Gating
- **Files**: `ai/image_processing/quality_check.py` | `ai_flow/preprocessing/utils.py`
- **Quality Checks**:
  - **Resolution**: Rejects images below $640 \times 480\text{px}$ (recommends $\ge 1920 \times 1080\text{px}$).
  - **Luminance & Glare**: Calculates grayscale luminance. Flags underexposure ($< 30$) or overexposure ($> 230$). Measures glare ratio (proportion of blown-out pixels with value $> 252$; flags glare if ratio $> 65\%$).
  - **Blur Detection**: Calculates edge gradient variance using Laplacian edge filters. Flags blur defect if edge average $< 8.0$.

---

### Stage B2: Preprocessing & Perspective Correction
- **Files**: `ai/image_processing/preprocessing.py` | `ai_flow/preprocessing/image_preprocessor.py`
- **Processing Steps**:
  - **Auto-Rotation & Deskewing**: Uses Hough Line Transforms to compute text orientation/skew angles and rotates image back to horizontal.
  - **Contrast Enhancement**: Applies contrast stretching (`ImageEnhance.Contrast` $\times 1.2$) and sharpening.
  - **Perspective Correction**: Locates quadrilateral boundary of the Principal Display Panel (PDP) and warps it into a flat, top-down rectangular crop using `cv2.getPerspectiveTransform` and `cv2.warpPerspective`.

---

### Stage B3: Multi-Engine OCR & Line Merging
- **Files**: `ai/ocr/ocr_engine.py` | `ai_flow/ocr/ocr_engine.py`
- **OCR Engines**: **PaddleOCR** (PP-OCRv6 medium models) as primary, with **EasyOCR** and **Pytesseract** wrappers available.
- **Line Merging Logic (`_merge_text_lines`)**:
  - Groups OCR detections sharing $\ge 50\%$ vertical overlap or $y$-distance $\le 25\text{px}$ into consolidated single-line entries.
  - Resolves fragmented OCR where labels and values split across bounding boxes (e.g. `"Net Quantity:"` + `"1 kg"`).

---

### Stage B4: Structured Field Extraction & Evidence Mapping
- **Files**: `ai/extraction/declaration_extractor.py` | `ai_flow/extraction/field_extractor.py`
- **Fields Extracted**:
  - `product_name`: Highest-area text in top 45% of image, excluding generic statutory label terms.
  - `mrp`: Currency-aware regex matcher (`MRP`, `M.R.P.`, `Maximum Retail Price`, `Rs.`, `₹`).
  - `net_quantity`: Numerical value + unit extraction (`g`, `gm`, `kg`, `ml`, `l`, `ltr`, `pcs`).
  - `manufacturing_date` & `expiry_date`: Regex parsing for `Mfg Date`, `Mfd.`, `Exp.`, `Best Before`, `Use Before` in multiple date formats (`MM/YYYY`, `DD/MM/YYYY`, `MMM YYYY`).
  - `manufacturer`, `packer`, `importer`: Company names preceding or following statutory indicators.
  - `country_of_origin`: Identifies `Country of Origin`, `Made in`, or `COO`.
  - `consumer_care`: Helpline numbers, email addresses, and contact points.
  - `address`: Detects 6-digit Indian Postal PIN codes and address blocks.
  - `batch_number`, `barcode` (EAN-13 / UPC-A), `fssai_license`.
- **Field Evidence Mapping**: Every field links to its original `source_text`, extraction `confidence`, and visual `bbox` $[x, y, w, h]$ for bounding box highlighting in the frontend UI.

---

### Stage C: Legal Metrology Compliance Rule Engine
- **Files**: `backend/rule_engine/compliance_engine.py` | `backend/app/services/scan_service.py`
- **Evaluation Engine**:
  1. **Statutory Applicability & Exemptions**: Evaluates package attributes (PDP surface area, net weight). Applies exemption checks under Rule 26 & Rule 3 (e.g., packages $< 10\text{g}$ / $< 10\text{ml}$ or wholesale/industrial commodities).
  2. **Rule Validation Modules**:
     - `DeclarationValidator`: Checks presence of all 8 mandatory statutory declarations.
     - `MRPValidator`: Validates inclusive tax phrasing (*"Incl. of all taxes"*) and unit sale price rules.
     - `NetQuantityValidator`: Verifies standard metric units.
     - `DateValidator`: Verifies valid manufacturing/expiry formats.
     - `FontValidator` & `PlacementValidator`: Checks minimum font height requirements against PDP area thresholds.
  3. **Decision & Audit Trail**: Generates an overall compliance status (`PASS`, `NEEDS_REVIEW`, `POTENTIAL_VIOLATION`), compliance score ($0–100\%$), audit trail, and structured violation findings.

---

### AI Component File Reference

| Component | File Path | Key Class / Function |
| :--- | :--- | :--- |
| **Live Package Detector** | `ai/detection/package_detector.py` | `detect_package_live()` |
| **Image Quality Assurance** | `ai/image_processing/quality_check.py` | `perform_image_quality_check()` |
| **Preprocessing & Deskew** | `ai_flow/preprocessing/image_preprocessor.py` | `ImagePreprocessor` |
| **OCR Engine** | `ai/ocr/ocr_engine.py` | `OCREngine` (PaddleOCR) |
| **Field Extractor** | `ai_flow/extraction/field_extractor.py` | `FieldExtractor` |
| **Scan Pipeline Entrypoint**| `ai_flow/pipeline/scan_pipeline.py` | `AIFieldExtractionPipeline` |
| **Compliance Rule Engine** | `backend/rule_engine/compliance_engine.py` | `LegalMetrologyComplianceEngine` |
| **API Router** | `backend/app/api/v1/ai.py` | `ai_scan_package_image()` |

---

## 2. Full Technical Stack Specification

### Frontend Stack
- **Framework**: **React 18** (`react`, `react-dom`) with **TypeScript 5** (`package.json`)
- **Build Tool**: **Vite 5** (`@vitejs/plugin-react`)
- **Routing**: **React Router DOM v6** (`react-router-dom`)
- **Styling**: **Vanilla CSS Design Token System** (`tokens.css`, `globals.css`, `components.css`, `citizen.css`)
- **Mapping & GIS**: **Leaflet 1.9** (`leaflet`, `@types/leaflet`)
- **Data Visualization**: **Recharts 2.10** (`recharts`)
- **Document & Data Export**: **jsPDF 2.5** (`jspdf`) for PDF notices & **SheetJS** (`xlsx`) for Excel reports

### Backend Stack
- **Framework**: **Python 3.10+** with **FastAPI** (`backend/requirements.txt`)
- **ASGI Server**: **Uvicorn**
- **Data Validation**: **Pydantic v2** & `pydantic-settings`
- **Database ORM**: **SQLAlchemy v2**
- **Database Migrations**: **Alembic** (`backend/alembic/env.py`)
- **Security & Auth**: `PyJWT` / `python-jose`, `passlib[bcrypt]`, `pwdlib[argon2]`, `python-multipart`

### AI / ML & Computer Vision Stack
- **Computer Vision**: **OpenCV** (`opencv-python` / `opencv-python-headless`), **Pillow (PIL)**
- **OCR Engines**: **PaddleOCR** (PP-OCRv6), **EasyOCR**, **PyTesseract**
- **Document Processing**: `pdf2image`, `PyPDF2`
- **Numerical Computation**: **NumPy**
- **Rule Engine**: Custom Python Statutory Rule Engine (`LegalMetrologyComplianceEngine`)

### Database & Infrastructure Stack
- **Production Database**: **PostgreSQL 16** (`docker-compose.yml`)
- **Development/Testing Database**: **SQLite** (`test.db`)
- **Containerization**: **Docker** & **Docker Compose**

### Testing & QA Stack
- **Testing Framework**: **PyTest** (`pytest`)
- **HTTP Integration Client**: **HTTPX** (`httpx`) & FastAPI `TestClient`

---

## 3. Advantages of the Technical Stack

### AI & Computer Vision Layer Advantages
- **Superior Text Detection on Complex Packages**: PaddleOCR PP-OCRv6 accurately extracts small, stylized, or curved text on metallic/glossy labels where generic OCR engines fail.
- **Low-Latency Camera Stream**: Classical CV package detection runs locally on downscaled frames (~15ms execution), allowing per-frame guidance without draining device batteries or requiring constant GPU usage.
- **Legal Explainability & Tamper-Evident Evidence**: Direct mapping of extracted fields to visual bounding box coordinates $[x, y, w, h]$ gives enforcement officers clear visual evidence suitable for legal proceedings.
- **Zero Hallucination Guarantee**: Coupling OCR with a deterministic rule engine ensures statutory compliance is calculated accurately according to written regulations.

### Backend Infrastructure Advantages
- **High Concurrency & Asynchronous Handling**: FastAPI + Uvicorn handles concurrent high-resolution image uploads efficiently.
- **Ultra-Fast Runtime Validation**: Pydantic v2 provides rapid JSON parsing and type-safe data pipelines.
- **Enterprise Persistence & Portability**: SQLAlchemy v2 + Alembic ensures transactional safety, version-controlled schema migrations, and seamless database portability.

### Frontend Application Advantages
- **Blazing Fast Development & Load Speeds**: Vite delivers sub-second startup times and instant HMR.
- **End-to-End Type Safety**: Shared TypeScript interfaces prevent runtime interface mismatches with backend APIs.
- **Zero Heavy CSS Framework Overhead**: Custom Vanilla CSS token architecture eliminates third-party framework bundle bloat and ensures smooth UI performance on budget mobile devices.
- **Offline Field Utilities**: Leaflet and client-side jsPDF/SheetJS enable offline geotagging, PDF notice generation, and report exports.

### Deployment & Operational Advantages
- **Single-Command Environment Replication**: Docker Compose replicates identical runtime environments (including Tesseract binaries and PostgreSQL dependencies) across development, testing, and production servers.
- **Automated Verification**: PyTest + HTTPX test suites enable comprehensive automated pipeline testing without requiring active external servers.

---

### Architectural Benefit Summary

| Metric / Dimension | Advantage Provided by Technical Stack |
| :--- | :--- |
| **Performance** | Asynchronous FastAPI + Rust-backed Pydantic v2 + Vite frontend bundle optimization. |
| **Field Usability** | Low-latency OpenCV frame checking + client-side PDF/Excel document generation. |
| **Legal Reliability** | Deterministic rule evaluation engine + bounding-box visual evidence mapping. |
| **Developer Velocity** | Shared TypeScript/Pydantic schemas + Docker containerization + PyTest integration. |
