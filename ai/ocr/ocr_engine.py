from typing import List, Dict, Any
from PIL import Image

try:
    from paddleocr import PaddleOCR
    PADDLE_OCR_AVAILABLE = True
except ImportError:
    PADDLE_OCR_AVAILABLE = False

import cv2
import numpy as np


def _get_paddle_ocr_model_dir() -> str:
    return "D:/paddle_models/PP-OCRv6_medium_det"


def _get_paddle_rec_model_dir() -> str:
    return "D:/paddle_models/PP-OCRv6_medium_rec"


class OCREngine:
    """Real PaddleOCR-based OCR engine — reads actual text from uploaded package images."""

    def __init__(self, use_gpu: bool = False):
        self.use_gpu = use_gpu
        self._reader = None
        self._initialized = False

    def _lazy_init(self):
        if self._initialized:
            return
        if not PADDLE_OCR_AVAILABLE:
            raise RuntimeError("PaddleOCR is not installed. Install with: pip install paddleocr paddlepaddle")
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

    def extract_text(self, img: Image.Image) -> Dict[str, Any]:
        self._lazy_init()

        # Convert PIL Image to numpy array for PaddleOCR
        nparr = np.array(img)
        if len(nparr.shape) == 2:
            nparr = cv2.cvtColor(nparr, cv2.COLOR_GRAY2BGR)
        elif nparr.shape[2] == 4:
            nparr = cv2.cvtColor(nparr, cv2.COLOR_RGBA2BGR)

        results = list(self._reader.predict(nparr))

        bounding_boxes: List[Dict[str, Any]] = []
        raw_text_parts: List[str] = []

        for r in results:
            dt_polys = r.get('dt_polys', [])
            rec_texts = r.get('rec_texts', [])
            rec_scores = r.get('rec_scores', [])

            for i, text in enumerate(rec_texts):
                if not text or not text.strip():
                    continue
                confidence = float(rec_scores[i]) if i < len(rec_scores) else 0.0
                if confidence < 0.1:
                    continue
                poly = dt_polys[i] if i < len(dt_polys) else np.zeros((4, 2), dtype=np.int32)
                xs = [int(p[0]) for p in poly]
                ys = [int(p[1]) for p in poly]
                x, y = min(xs), min(ys)
                w, h = max(xs) - x, max(ys) - y
                bounding_boxes.append({
                    "text": text.strip(),
                    "box": {"x": x, "y": y, "w": w, "h": h},
                    "confidence": round(confidence, 4),
                })
                raw_text_parts.append(text.strip())

        raw_text = " | ".join(raw_text_parts)
        avg_confidence = round(
            sum(b["confidence"] for b in bounding_boxes) / max(1, len(bounding_boxes)), 2
        )
        return {
            "raw_text": raw_text,
            "bounding_boxes": bounding_boxes,
            "avg_confidence": avg_confidence,
            "engine": self._engine,
        }
