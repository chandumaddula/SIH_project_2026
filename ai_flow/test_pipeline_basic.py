"""
Basic test that doesn't require OCR dependencies.
Tests core pipeline structure and field extraction.
"""
import os
import sys
import io

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_imports():
    """Test that all ai_flow modules can be imported (excluding OCR)."""
    print("="*60)
    print("Test 1: AI Flow Module Imports")
    print("="*60)

    test_results = []

    # Config
    try:
        from ai_flow import config
        print(f"[OK] config.py (OCR_ENGINE={config.OCR_ENGINE})")
        test_results.append(True)
    except Exception as e:
        print(f"[ERROR] config.py: {e}")
        test_results.append(False)

    # Preprocessing
    try:
        from ai_flow.preprocessing.image_preprocessor import ImagePreprocessor
        from ai_flow.preprocessing.utils import validate_image_quality, preprocess_image
        print("[OK] preprocessing module")
        test_results.append(True)
    except Exception as e:
        print(f"[ERROR] preprocessing: {e}")
        test_results.append(False)

    # Detection
    try:
        from ai_flow.detection.package_detector import PackageDetector
        print("[OK] detection module")
        test_results.append(True)
    except Exception as e:
        print(f"[ERROR] detection: {e}")
        test_results.append(False)

    # Field Extraction
    try:
        from ai_flow.extraction.field_extractor import FieldExtractor
        print("[OK] extraction module")
        test_results.append(True)
    except Exception as e:
        print(f"[ERROR] extraction: {e}")
        test_results.append(False)

    # Schemas
    try:
        from ai_flow.schemas.result import (
            ScanResponse, OCRTextItem, ExtractedField,
            ImageQualityResult, PackageDetectionResult
        )
        print("[OK] schemas module")
        test_results.append(True)
    except Exception as e:
        print(f"[ERROR] schemas: {e}")
        test_results.append(False)

    return all(test_results)


def test_field_extraction():
    """Test field extraction with mock OCR data."""
    print("\n" + "="*60)
    print("Test 2: Field Extraction")
    print("="*60)

    try:
        from ai_flow.extraction.field_extractor import FieldExtractor

        # Mock OCR data simulating real package label
        mock_ocr = [
            {"text": "ABC PREMIUM RICE", "confidence": 0.98, "bbox": [50, 30, 400, 50]},
            {"text": "Manufactured by ABC Foods Pvt Ltd", "confidence": 0.95, "bbox": [50, 100, 500, 30]},
            {"text": "Net Quantity: 1 kg", "confidence": 0.97, "bbox": [50, 200, 300, 30]},
            {"text": "MRP Rs. 120 (Incl. of all taxes)", "confidence": 0.96, "bbox": [50, 300, 450, 30]},
            {"text": "Packed 08/2026", "confidence": 0.90, "bbox": [50, 400, 200, 25]},
            {"text": "Consumer Care 1800-123-4567", "confidence": 0.93, "bbox": [50, 500, 350, 25]},
            {"text": "Country of Origin India", "confidence": 0.92, "bbox": [50, 550, 250, 25]},
            {"text": "Batch No ABC-2024-001", "confidence": 0.91, "bbox": [50, 600, 300, 25]},
        ]

        extractor = FieldExtractor()
        fields = extractor.extract_from_ocr(mock_ocr)

        # Verify results
        expected_fields = ["product_name", "mrp", "net_quantity", "manufacturer",
                          "manufacturing_date", "consumer_care", "country_of_origin",
                          "batch_number"]
        found_fields = [f for f in expected_fields if f in fields]

        print(f"[OK] Extracted {len(fields)} fields")
        for name, field in fields.items():
            print(f"  - {name}: {field.value} (conf: {field.confidence:.2f})")

        if len(found_fields) >= 5:
            print(f"[OK] Found {len(found_fields)}/{len(expected_fields)} expected fields")
            return True
        else:
            print(f"[WARN] Only found {len(found_fields)}/{len(expected_fields)} expected fields")
            return False

    except Exception as e:
        print(f"[ERROR] Field extraction test failed: {e}")
        return False


def test_preprocessing():
    """Test image preprocessing utilities."""
    print("\n" + "="*60)
    print("Test 3: Image Preprocessing")
    print("="*60)

    try:
        from ai_flow.preprocessing.utils import validate_image_quality, preprocess_image
        import numpy as np

        # Create a test image
        img = np.ones((400, 600, 3), dtype=np.uint8) * 128  # Gray image

        # Add some text-like patterns
        for i in range(0, 400, 30):
            cv2_available = False
            try:
                import cv2
                cv2_available = True
                cv2.line(img, (50, i), (550, i), (0, 0, 0), 2)
            except ImportError:
                pass

        if not cv2_available:
            print("[SKIP] OpenCV not available for preprocessing test")
            return True  # Skip but pass

        # Test quality validation
        quality = validate_image_quality(img)
        print(f"[OK] Quality check: usable={quality['usable']}, score={quality['quality_score']:.2f}")

        # Test preprocessing
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        preprocessed = preprocess_image(gray)
        print(f"[OK] Preprocessing: {preprocessed.shape}")

        return True
    except Exception as e:
        print(f"[ERROR] Preprocessing test failed: {e}")
        return False


def test_detection():
    """Test package detection."""
    print("\n" + "="*60)
    print("Test 4: Package Detection")
    print("="*60)

    try:
        from ai_flow.detection.package_detector import PackageDetector
        import numpy as np

        cv2_available = False
        try:
            import cv2
            cv2_available = True
        except ImportError:
            print("[SKIP] OpenCV not available for detection test")
            return True  # Skip but pass

        if not cv2_available:
            return True

        detector = PackageDetector()

        # Create a test image with a "label" region
        img = np.ones((600, 800, 3), dtype=np.uint8) * 200

        # Add a rectangular "label" area
        cv2.rectangle(img, (100, 100), (700, 500), (255, 255, 255), -1)
        cv2.rectangle(img, (100, 100), (700, 500), (0, 0, 0), 3)

        # Add some text patterns
        for y in range(150, 500, 40):
            cv2.line(img, (130, y), (650, y), (0, 0, 0), 1)

        # Convert to bytes
        success, encoded = cv2.imencode('.jpg', img)
        image_bytes = encoded.tobytes()

        result = detector.detect_package_region(image_bytes)
        print(f"[OK] Detection result: detected={result.get('detected')}, confidence={result.get('confidence', 0):.2f}")

        return True
    except Exception as e:
        print(f"[ERROR] Detection test failed: {e}")
        return False


def test_schemas():
    """Test Pydantic schemas."""
    print("\n" + "="*60)
    print("Test 5: Pydantic Schemas")
    print("="*60)

    try:
        from ai_flow.schemas.result import (
            ScanResponse, OCRTextItem, ImageQualityResult,
            PackageDetectionResult, ExtractedField
        )
        import json

        # Create test objects
        ocr_item = OCRTextItem(
            text="MRP Rs. 120",
            confidence=0.96,
            bbox=[100, 200, 200, 30]
        )
        print(f"[OK] OCRTextItem: {ocr_item.text}")

        quality = ImageQualityResult(
            quality_score=0.95,
            usable=True,
            defects=[],
            dimensions={"width": 800, "height": 600}
        )
        print(f"[OK] ImageQualityResult: usable={quality.usable}")

        detection = PackageDetectionResult(
            detected=True,
            confidence=0.85,
            bounding_box=[100, 50, 600, 400]
        )
        print(f"[OK] PackageDetectionResult: detected={detection.detected}")

        field = ExtractedField(
            field_name="mrp",
            value=120.0,
            confidence=0.96,
            source_text="MRP Rs. 120",
            bbox=[100, 200, 200, 30],
            currency="INR"
        )
        print(f"[OK] ExtractedField: {field.field_name}={field.value}")

        response = ScanResponse(
            scan_id="TEST-001",
            image_quality=quality,
            package_detection=detection,
            ocr=[ocr_item],
            fields={"mrp": {"value": 120, "confidence": 0.96, "source_text": "MRP Rs. 120", "bbox": [100, 200, 200, 30]}}
        )

        # Test JSON serialization
        json_str = response.model_dump_json()
        print(f"[OK] ScanResponse JSON serialization: {len(json_str)} bytes")

        return True
    except Exception as e:
        print(f"[ERROR] Schema test failed: {e}")
        return False


def main():
    """Run all tests."""
    print("="*60)
    print("AI Flow Pipeline Tests (No OCR Dependencies Required)")
    print("="*60)

    tests = [
        ("Module Imports", test_imports),
        ("Field Extraction", test_field_extraction),
        ("Preprocessing", test_preprocessing),
        ("Package Detection", test_detection),
        ("Schemas", test_schemas),
    ]

    results = []
    for name, test_func in tests:
        try:
            passed = test_func()
            results.append((name, passed))
        except Exception as e:
            print(f"[ERROR] {name} test crashed: {e}")
            results.append((name, False))

    print("\n" + "="*60)
    print("Test Results Summary")
    print("="*60)
    passed_count = 0
    for name, passed in results:
        status = "[PASS]" if passed else "[FAIL]"
        print(f"  {status}: {name}")
        if passed:
            passed_count += 1

    print(f"\nTotal: {passed_count}/{len(results)} tests passed")
    return passed_count == len(results)


if __name__ == "__main__":
    main()