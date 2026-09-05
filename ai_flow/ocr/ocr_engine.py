import easyocr
import cv2
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
import base64
import io
from PIL import Image


class OCR:
    """
    EasyOCR-based OCR Engine for legal metrology label text extraction.

    Features:
    - Multi-language support (English + Hindi for Indian context)
    - Confidence scoring for each detection
    - Bounding box extraction
    - Text line merging for better readability
    - GPU acceleration support (optional)
    """

    def __init__(self, languages: List[str] = None, use_gpu: bool = False):
        """
        Initialize the OCR engine.

        Args:
            languages: List of language codes to support. Default: ['en']
            use_gpu: Whether to use GPU acceleration if available
        """
        if languages is None:
            languages = ['en']  # English as primary

        self.languages = languages
        self.use_gpu = use_gpu
        self._reader = None
        self._initialized = False

    def _lazy_init(self):
        """Lazy initialization of EasyOCR reader to avoid startup delay."""
        if not self._initialized:
            try:
                self._reader = easyocr.Reader(
                    self.languages,
                    gpu=self.use_gpu,
                    verbose=False
                )
                self._initialized = True
            except Exception as e:
                raise RuntimeError(f"Failed to initialize EasyOCR: {str(e)}")

    def detect_text(self, image_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Detect text in an image and return structured results.

        Args:
            image_bytes: Raw image bytes (JPG, PNG, WebP)

        Returns:
            List of dictionaries containing:
            - text: The recognized text string
            - confidence: Confidence score (0-1)
            - bbox: Bounding box as [x, y, width, height] in pixels
            - polygon: Four-point polygon for precise localization
        """
        self._lazy_init()

        try:
            # Decode image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                raise ValueError("Failed to decode image")

            # Run OCR
            results = self._reader.readtext(img)

            # Convert to standardized format
            ocr_results = []
            for (bbox, text, confidence) in results:
                # bbox is list of 4 points: [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
                # Convert to [x, y, width, height]
                xs = [p[0] for p in bbox]
                ys = [p[1] for p in bbox]

                x = min(xs)
                y = min(ys)
                width = max(xs) - min(xs)
                height = max(ys) - min(ys)

                # Filter out very low confidence results
                if confidence >= 0.1:
                    ocr_results.append({
                        "text": text.strip(),
                        "confidence": round(confidence, 4),
                        "bbox": [int(x), int(y), int(width), int(height)],
                        "polygon": [[int(p[0]), int(p[1])] for p in bbox]
                    })

            # Sort by reading order (top to bottom, left to right)
            ocr_results.sort(key=lambda r: (r["bbox"][1], r["bbox"][0]))

            return ocr_results

        except Exception as e:
            raise RuntimeError(f"OCR processing failed: {str(e)}")

    def detect_text_with_preprocessing(self, image_bytes: bytes,
                                        preprocessed: bool = False) -> List[Dict[str, Any]]:
        """
        Detect text with optional preprocessing step.

        Args:
            image_bytes: Raw image bytes
            preprocessed: Whether image has already been preprocessed

        Returns:
            List of OCR results
        """
        if preprocessed:
            return self.detect_text(image_bytes)

        # For non-preprocessed images, we could apply quick preprocessing
        # but it's better to use the dedicated preprocessing module
        return self.detect_text(image_bytes)

    def get_full_text(self, image_bytes: bytes) -> str:
        """
        Get full extracted text as a single string.

        Args:
            image_bytes: Raw image bytes

        Returns:
            Concatenated text from all detections
        """
        results = self.detect_text(image_bytes)
        return " ".join([r["text"] for r in results])

    def get_text_with_positions(self, image_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Get text with detailed position information.

        Args:
            image_bytes: Raw image bytes

        Returns:
            List of results with text, confidence, and detailed positions
        """
        return self.detect_text(image_bytes)

    def detect_text_lines(self, image_bytes: bytes, line_threshold: int = 20) -> List[Dict[str, Any]]:
        """
        Detect text and group into lines.

        Args:
            image_bytes: Raw image bytes
            line_threshold: Maximum vertical distance to consider same line (pixels)

        Returns:
            List of text lines with merged text and combined bbox
        """
        results = self.detect_text(image_bytes)

        if not results:
            return []

        # Group by lines based on y-coordinate
        lines = []
        current_line = [results[0]]

        for i in range(1, len(results)):
            prev_y = current_line[-1]["bbox"][1]
            curr_y = results[i]["bbox"][1]

            if abs(curr_y - prev_y) <= line_threshold:
                current_line.append(results[i])
            else:
                # Finalize current line
                lines.append(self._merge_line(current_line))
                current_line = [results[i]]

        # Don't forget the last line
        if current_line:
            lines.append(self._merge_line(current_line))

        return lines

    def _merge_line(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Merge multiple text items into a single line."""
        if len(items) == 1:
            return items[0]

        # Sort by x-coordinate
        items.sort(key=lambda r: r["bbox"][0])

        # Merge text
        merged_text = " ".join([item["text"] for item in items])

        # Combined bbox
        min_x = min(item["bbox"][0] for item in items)
        min_y = min(item["bbox"][1] for item in items)
        max_x = max(item["bbox"][0] + item["bbox"][2] for item in items)
        max_y = max(item["bbox"][1] + item["bbox"][3] for item in items)

        # Average confidence
        avg_conf = sum(item["confidence"] for item in items) / len(items)

        return {
            "text": merged_text,
            "confidence": round(avg_conf, 4),
            "bbox": [min_x, min_y, max_x - min_x, max_y - min_y],
            "components": items
        }

    def crop_to_text_regions(self, image_bytes: bytes, padding: int = 20) -> List[Dict[str, Any]]:
        """
        Crop image to text regions with padding.

        Args:
            image_bytes: Raw image bytes
            padding: Padding around text regions in pixels

        Returns:
            List of cropped regions with their text and positions
        """
        results = self.detect_text(image_bytes)

        if not results:
            return []

        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return []

        height, width = img.shape[:2]
        crops = []

        for result in results:
            x, y, w, h = result["bbox"]

            # Add padding
            x1 = max(0, x - padding)
            y1 = max(0, y - padding)
            x2 = min(width, x + w + padding)
            y2 = min(height, y + h + padding)

            # Crop
            crop = img[y1:y2, x1:x2]

            # Encode crop
            _, encoded = cv2.imencode('.jpg', crop)
            crop_bytes = encoded.tobytes()
            crop_b64 = base64.b64encode(crop_bytes).decode('utf-8')

            crops.append({
                "text": result["text"],
                "confidence": result["confidence"],
                "bbox": result["bbox"],
                "crop_base64": crop_b64
            })

        return crops

    @staticmethod
    def draw_bounding_boxes(image_bytes: bytes, ocr_results: List[Dict[str, Any]],
                           color: Tuple[int, int, int] = (0, 255, 0),
                           thickness: int = 2) -> bytes:
        """
        Draw OCR bounding boxes on image for visualization.

        Args:
            image_bytes: Original image bytes
            ocr_results: OCR results from detect_text()
            color: BGR color tuple for boxes
            thickness: Line thickness

        Returns:
            Annotated image bytes
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return image_bytes

        for result in ocr_results:
            x, y, w, h = result["bbox"]
            cv2.rectangle(img, (x, y), (x + w, y + h), color, thickness)

            # Add text label
            cv2.putText(img, f"{result['confidence']:.2f}",
                       (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

        _, encoded = cv2.imencode('.jpg', img)
        return encoded.tobytes()

    def get_supported_languages(self) -> List[str]:
        """Get list of supported languages."""
        return self.languages.copy()


# Singleton instance for easy reuse
_ocr_instance = None


def get_ocr_instance(languages: List[str] = None, use_gpu: bool = False) -> OCR:
    """Get or create OCR singleton instance."""
    global _ocr_instance
    if _ocr_instance is None:
        _ocr_instance = OCR(languages, use_gpu)
    return _ocr_instance