import cv2
import numpy as np
from PIL import Image
from typing import Tuple, Dict, Any
import math
from .utils import validate_image_quality, preprocess_image, detect_orientation

class ImagePreprocessor:
    """
    Advanced image preprocessing for OCR-based legal metrology compliance.

    Features:
    - Image validation and quality checks
    - Automatic rotation and deskewing
    - Contrast enhancement and noise reduction
    - Perspective correction for label extraction
    - Resolution optimization
    """

    def __init__(self):
        # Initialize preprocessing parameters
        self.min_width = 300
        self.min_height = 300
        self.max_width = 1200
        self.max_height = 1200

    def validate_and_preprocess(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Complete preprocessing pipeline for legal metrology label analysis.

        Args:
            image_bytes: Raw image bytes from camera/upload

        Returns:
            Dictionary containing:
            - processed_image: Preprocessed image as bytes
            - quality_score: Quality assessment score (0-1)
            - has_issues: Whether image has quality problems
            - orientation: Detected orientation
            - deskew_angle: Calculated deskew angle
            - dimensions: Image dimensions
            - warnings: List of quality warnings
        """
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                return self._create_error_result("Invalid image format")

            original_height, original_width = img.shape[:2]

            # Check minimum resolution
            if original_width < self.min_width or original_height < self.min_height:
                return self._create_error_result(
                    f"Image resolution too low: {original_width}x{original_height}. "
                    f"Minimum required: {self.min_width}x{self.min_height}"
                )

            # Validate image quality
            quality_check = validate_image_quality(img)
            if not quality_check["usable"]:
                return self._create_error_result(
                    f"Image quality issues: {', '.join(quality_check['defects'])}"
                )

            # Detect orientation and deskew
            orientation = detect_orientation(img)
            deskew_angle = self._calculate_deskew_angle(img, orientation)

            # Apply preprocessing pipeline
            processed_img = self._apply_preprocessing(img, deskew_angle)

            # Resize if necessary
            processed_img = self._resize_if_needed(processed_img)

            # Convert back to bytes
            processed_bytes = self._image_to_bytes(processed_img)

            return {
                "processed_image": processed_bytes,
                "quality_score": quality_check["quality_score"],
                "has_issues": not quality_check["usable"],
                "orientation": orientation,
                "deskew_angle": deskew_angle,
                "dimensions": {
                    "width": processed_img.shape[1],
                    "height": processed_img.shape[0]
                },
                "warnings": quality_check["defects"]
            }

        except Exception as e:
            return self._create_error_result(f"Preprocessing failed: {str(e)}")

    def _calculate_deskew_angle(self, img: np.ndarray, orientation: str) -> float:
        """Calculate optimal deskew angle based on image orientation."""
        if orientation == "right":
            return 90
        elif orientation == "left":
            return -90
        elif orientation == "upside_down":
            return 180

        # For normal orientation, calculate skew angle using projection profile
        try:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

            # Get projection profile
            horizontal_projection = np.sum(thresh, axis=0)

            # Find peaks in projection
            peaks = self._find_peaks(horizontal_projection)

            if len(peaks) < 2:
                return 0.0

            # Calculate average angle from peaks
            angles = []
            for i in range(1, len(peaks)):
                if peaks[i] - peaks[i-1] > 10:  # Significant gap
                    angle = math.atan2(i - peaks[i-1], 1.0) * 180 / math.pi
                    angles.append(angle)

            return np.mean(angles) if angles else 0.0

        except Exception:
            return 0.0

    def _find_peaks(self, signal: np.ndarray, min_distance: int = 10) -> list:
        """Find peaks in 1D signal."""
        peaks = []
        for i in range(1, len(signal) - 1):
            if signal[i] > signal[i-1] and signal[i] > signal[i+1]:
                # Check if peak is sufficiently distant from previous peak
                if not peaks or i - peaks[-1] >= min_distance:
                    peaks.append(i)
        return peaks

    def _apply_preprocessing(self, img: np.ndarray, angle: float) -> np.ndarray:
        """Apply complete preprocessing pipeline."""
        # Rotate if needed
        if abs(angle) > 1.0:
            center = (img.shape[1] // 2, img.shape[0] // 2)
            rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
            img = cv2.warpAffine(img, rotation_matrix, (img.shape[1], img.shape[0]),
                               borderMode=cv2.BORDER_REPLICATE)

        # Convert to grayscale for processing
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Apply preprocessing using utility function
        preprocessed = preprocess_image(gray)

        # Convert back to BGR for consistency
        return cv2.cvtColor(preprocessed, cv2.COLOR_GRAY2BGR)

    def _resize_if_needed(self, img: np.ndarray) -> np.ndarray:
        """Resize image if it exceeds maximum dimensions."""
        height, width = img.shape[:2]

        if width > self.max_width or height > self.max_height:
            # Calculate scaling factor
            scale = min(self.max_width / width, self.max_height / height)
            new_width = int(width * scale)
            new_height = int(height * scale)

            img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_AREA)

        return img

    def _image_to_bytes(self, img: np.ndarray) -> bytes:
        """Convert numpy image array to bytes."""
        success, encoded = cv2.imencode('.jpg', img)
        if success:
            return encoded.tobytes()
        raise ValueError("Failed to encode image")

    def _create_error_result(self, error_message: str) -> Dict[str, Any]:
        """Create standardized error result."""
        return {
            "error": error_message,
            "processed_image": None,
            "quality_score": 0.0,
            "has_issues": True,
            "orientation": "unknown",
            "deskew_angle": 0.0,
            "dimensions": {"width": 0, "height": 0},
            "warnings": [error_message]
        }

    @staticmethod
    def get_supported_formats() -> list:
        """Get list of supported image formats."""
        return ['.jpg', '.jpeg', '.png', '.webp']