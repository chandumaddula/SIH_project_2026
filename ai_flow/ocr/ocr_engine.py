import cv2
import numpy as np
from typing import List, Dict, Any, Optional
import base64
import io
from PIL import Image

try:
    from paddleocr import PaddleOCR
    PADDLE_OCR_AVAILABLE = True
except ImportError:
    PADDLE_OCR_AVAILABLE = False


def _get_paddle_ocr_model_dir() -> str:
    """Return the path to the local PaddleOCR detection model."""
    return "D:/paddle_models/PP-OCRv6_medium_det"


def _get_paddle_rec_model_dir() -> str:
    """Return the path to the local PaddleOCR recognition model."""
    return "D:/paddle_models/PP-OCRv6_medium_rec"


class OCR:
    """
    PaddleOCR-based OCR Engine for legal metrology label text extraction.

    Uses locally cached PP-OCRv6 models (detection + recognition).
    Falls back gracefully if models are unavailable.
    """

    def __init__(self, languages: List[str] = None, use_gpu: bool = False):
        if languages is None:
            languages = ['en']
        self.languages = languages
        self.use_gpu = use_gpu
        self._reader = None
        self._initialized = False

    def _lazy_init(self):
        if not self._initialized:
            if not PADDLE_OCR_AVAILABLE:
                raise RuntimeError("PaddleOCR is not installed. Run: pip install paddleocr paddlepaddle")
            try:
                self._reader = PaddleOCR(
                    text_detection_model_dir=_get_paddle_ocr_model_dir(),
                    text_recognition_model_dir=_get_paddle_rec_model_dir(),
                    use_textline_orientation=False,
                    use_doc_orientation_classify=False,
                    use_doc_unwarping=False,
                    enable_mkldnn=False,
                    use_tensorrt=False,
                    precision='fp32',
                    device='cpu',
                    cpu_threads=4,
                    
                )
                self._engine = "paddleocr"
                self._initialized = True
            except Exception as e:
                raise RuntimeError(f"Failed to initialize PaddleOCR: {str(e)}")

    def detect_text(self, image_bytes: bytes) -> List[Dict[str, Any]]:
        self._lazy_init()

        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Failed to decode image")

            results = list(self._reader.predict(img))
            ocr_results = []
            for r in results:
                dt_polys = r.get('dt_polys', [])
                rec_texts = r.get('rec_texts', [])
                rec_scores = r.get('rec_scores', [])

                for i, text in enumerate(rec_texts):
                    poly = dt_polys[i] if i < len(dt_polys) else np.array([[0, 0], [0, 0], [0, 0], [0, 0]])
                    confidence = float(rec_scores[i]) if i < len(rec_scores) else 0.0
                    if not text or text.strip() == "":
                        continue
                    if confidence < 0.1:
                        continue
                    # Convert polygon to bbox [x, y, w, h]
                    xs = [int(p[0]) for p in poly]
                    ys = [int(p[1]) for p in poly]
                    x, y = min(xs), min(ys)
                    w, h = max(xs) - x, max(ys) - y
                    ocr_results.append({
                        "text": text.strip(),
                        "confidence": round(confidence, 4),
                        "bbox": [x, y, w, h],
                        "polygon": [[int(p[0]), int(p[1])] for p in poly]
                    })

            # Sort by reading order (top to bottom, left to right)
            ocr_results.sort(key=lambda r: (r["bbox"][1], r["bbox"][0]))
            return ocr_results

        except Exception as e:
            raise RuntimeError(f"OCR processing failed: {str(e)}")


_ocr_instance = None


def get_ocr_instance(languages: List[str] = None, use_gpu: bool = False) -> OCR:
    global _ocr_instance
    if _ocr_instance is None:
        _ocr_instance = OCR(languages, use_gpu)
    return _ocr_instance
