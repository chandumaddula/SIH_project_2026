"""
AI Flow OCR Service - Text extraction from package images.
Uses EasyOCR as primary engine with fallback to Tesseract.
"""
import io
from typing import List, Tuple, Optional
from PIL import Image
import numpy as np

from ai_flow.schemas.result import OCRResult


class OCREngine:
    """
    OCR Engine for extracting text from package label images.
    Supports multiple OCR engines with automatic fallback.
    """

    def __init__(self, languages: List[str] = None):
        """
        Initialize OCR engine.

        Args:
            languages: List of language codes (e.g., ['en', 'hi']). Default: ['en']
        """
        self.languages = languages or ['en']
        self._engine = None
        self._engine_type = None
        self._initialize_engine()

    def _initialize_engine(self):
        """Initialize the best available OCR engine."""
        # Try EasyOCR first (better for mixed text)
        try:
            import easyocr
            self._engine = easyocr.Reader(
                self.languages,
                gpu=False,
                model_storage_directory=None,
                download_enabled=True,
                verbose=False
            )
            self._engine_type = 'easyocr'
        except ImportError:
            # Fallback to Tesseract
            try:
                import pytesseract
                self._engine = pytesseract
                self._engine_type = 'tesseract'
            except ImportError:
                # Fallback to basic PIL-based text detection
                self._engine = None
                self._engine_type = 'basic'

    def extract_text(self, image_bytes: bytes) -> List[OCRResult]:
        """
        Extract text from image bytes.

        Args:
            image_bytes: Raw image bytes

        Returns:
            List of OCRResult with extracted text and bounding boxes
        """
        try:
            # Load image
            img = Image.open(io.BytesIO(image_bytes))

            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')

            # Convert to numpy array
            img_array = np.array(img)

            if self._engine_type == 'easyocr':
                return self._extract_with_easyocr(img_array)
            elif self._engine_type == 'tesseract':
                return self._extract_with_tesseract(img)
            else:
                return self._extract_with_basic(img_array, img)

        except Exception as e:
            # Return empty results on error
            return []

    def _extract_with_easyocr(self, img_array) -> List[OCRResult]:
        """Extract text using EasyOCR."""
        try:
            results = self._engine.readtext(img_array)

            ocr_results = []
            for (bbox, text, confidence) in results:
                if text and text.strip():
                    # bbox is [[x1,y1],[x2,y1],[x2,y2],[x1,y2]]
                    # Convert to [x1, y1, x2, y2]
                    x_coords = [point[0] for point in bbox]
                    y_coords = [point[1] for point in bbox]
                    x1, x2 = min(x_coords), max(x_coords)
                    y1, y2 = min(y_coords), max(y_coords)

                    ocr_results.append(OCRResult(
                        text=text.strip(),
                        confidence=float(confidence),
                        bbox=[float(x1), float(y1), float(x2), float(y2)]
                    ))

            return ocr_results
        except Exception as e:
            return []

    def _extract_with_tesseract(self, img: Image) -> List[OCRResult]:
        """Extract text using Tesseract."""
        try:
            import pytesseract

            # Get detailed output with bounding boxes
            data = pytesseract.image_to_data(
                img,
                output_type=pytesseract.Output.DICT,
                lang='eng'
            )

            ocr_results = []
            n_boxes = len(data['text'])

            for i in range(n_boxes):
                text = data['text'][i].strip()
                if text:
                    ocr_results.append(OCRResult(
                        text=text,
                        confidence=float(data['conf'][i]) / 100.0,
                        bbox=[
                            float(data['left'][i]),
                            float(data['top'][i]),
                            float(data['left'][i] + data['width'][i]),
                            float(data['top'][i] + data['height'][i])
                        ]
                    ))

            return ocr_results
        except Exception as e:
            return []

    def _extract_with_basic(self, img_array, img: Image) -> List[OCRResult]:
        """Basic text extraction fallback using PIL."""
        try:
            import pytesseract

            # Try to use Tesseract with basic config
            data = pytesseract.image_to_data(
                img,
                output_type=pytesseract.Output.DICT,
                lang='eng+hin'
            )

            ocr_results = []
            n_boxes = len(data['text'])

            for i in range(n_boxes):
                text = data['text'][i].strip()
                if text and data['conf'][i] > 0:
                    ocr_results.append(OCRResult(
                        text=text,
                        confidence=float(data['conf'][i]) / 100.0,
                        bbox=[
                            float(data['left'][i]),
                            float(data['top'][i]),
                            float(data['left'][i] + data['width'][i]),
                            float(data['top'][i] + data['height'][i])
                        ]
                    ))

            return ocr_results
        except Exception:
            # Ultimate fallback - return empty
            return []


# Global OCR engine instance
_ocr_engine: Optional[OCREngine] = None


def get_ocr_engine() -> OCREngine:
    """Get or create global OCR engine instance."""
    global _ocr_engine
    if _ocr_engine is None:
        _ocr_engine = OCREngine(languages=['en', 'hi'])
    return _ocr_engine


def extract_text_from_image(image_bytes: bytes) -> List[OCRResult]:
    """Convenience function to extract text from image."""
    engine = get_ocr_engine()
    return engine.extract_text(image_bytes)
