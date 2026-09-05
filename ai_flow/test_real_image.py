"""
End-to-end test with a real (synthetic) image.
Creates a test image with text and runs the full pipeline.
"""
import os
import sys
import io
import json

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def create_real_test_image():
    """
    Create a realistic test image simulating a package label.
    Returns image bytes ready for processing.
    """
    try:
        from PIL import Image, ImageDraw, ImageFont
        import cv2
        import numpy as np
    except ImportError:
        return None

    # Create a 800x600 image with white background
    img = Image.new('RGB', (800, 600), color='white')
    draw = ImageDraw.Draw(img)

    # Try to use system font
    try:
        font_huge = ImageFont.truetype("arial.ttf", 48)
        font_large = ImageFont.truetype("arial.ttf", 32)
        font_medium = ImageFont.truetype("arial.ttf", 24)
        font_small = ImageFont.truetype("arial.ttf", 20)
    except (OSError, IOError):
        try:
            font_huge = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
            font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32)
            font_medium = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
            font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
        except (OSError, IOError):
            font_huge = font_large = font_medium = font_small = ImageFont.load_default()

    # Draw label content
    y = 30
    lines = [
        ("ABC PREMIUM RICE", font_huge, (50, y), 'black'),
        ("Manufactured by ABC Foods Pvt Ltd", font_medium, (50, y+80), 'black'),
        ("Net Quantity: 1 kg", font_medium, (50, y+140), 'black'),
        ("MRP: Rs. 120", font_medium, (50, y+200), 'black'),
        ("Packed: 08/2026", font_small, (50, y+280), 'black'),
        ("Consumer Care: 1800-123-4567", font_small, (50, y+330), 'black'),
        ("Country of Origin: India", font_small, (50, y+380), 'black'),
        ("Batch No: ABC-2024-001", font_small, (50, y+430), 'black'),
    ]

    for text, font, position, color in lines:
        draw.text(position, text, fill=color, font=font)

    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    return img_bytes.getvalue()


def test_with_real_image():
    """Test the pipeline with a real (synthetic) image."""
    print("="*60)
    print("Real Image End-to-End Test")
    print("="*60)

    image_bytes = create_real_test_image()
    if not image_bytes:
        print("[ERROR] Could not create test image (PIL/OpenCV missing)")
        return False

    print(f"[OK] Created test image: {len(image_bytes)} bytes")

    # Test 1: Preprocessing
    print("\n--- Test 1: Image Preprocessing ---")
    try:
        from ai_flow.preprocessing.image_preprocessor import ImagePreprocessor

        preprocessor = ImagePreprocessor()
        result = preprocessor.validate_and_preprocess(image_bytes)

        if result.get("error"):
            print(f"[WARN] Preprocessing error: {result['error']}")
        else:
            print(f"[OK] Preprocessing complete")
            print(f"  Dimensions: {result['dimensions']}")
            print(f"  Quality score: {result['quality_score']:.2f}")
            print(f"  Orientation: {result['orientation']}")
    except Exception as e:
        print(f"[ERROR] Preprocessing failed: {e}")
        return False

    # Test 2: Package Detection
    print("\n--- Test 2: Package Detection ---")
    try:
        from ai_flow.detection.package_detector import PackageDetector

        detector = PackageDetector()
        result = detector.detect_package_region(image_bytes)

        print(f"[OK] Package detection complete")
        print(f"  Detected: {result.get('detected')}")
        print(f"  Confidence: {result.get('confidence', 0):.2f}")
        print(f"  Bounding box: {result.get('bounding_box')}")
    except Exception as e:
        print(f"[ERROR] Package detection failed: {e}")
        return False

    # Test 3: OCR (skip if torch/easyocr not available)
    print("\n--- Test 3: OCR Engine ---")
    try:
        import easyocr
        from ai_flow.ocr.ocr_engine import OCR

        ocr = OCR()
        ocr_results = ocr.detect_text(image_bytes)

        print(f"[OK] OCR completed")
        print(f"  Found {len(ocr_results)} text items")
        for i, r in enumerate(ocr_results[:8]):
            print(f"  {i+1}. '{r['text']}' (conf: {r['confidence']:.2f})")

        ocr_available = True
    except ImportError as e:
        print(f"[WARN] OCR dependencies not available: {e}")
        print("  (PyTorch/EasyOCR need to be installed for full OCR)")
        ocr_available = False

        # Use mock OCR data for field extraction test
        print("  Using simulated OCR for field extraction test...")
        ocr_results = [
            {"text": "ABC PREMIUM RICE", "confidence": 0.98, "bbox": [50, 30, 400, 50]},
            {"text": "Manufactured by ABC Foods Pvt Ltd", "confidence": 0.95, "bbox": [50, 100, 500, 30]},
            {"text": "Net Quantity: 1 kg", "confidence": 0.97, "bbox": [50, 200, 300, 30]},
            {"text": "MRP: Rs. 120", "confidence": 0.96, "bbox": [50, 300, 250, 30]},
            {"text": "Packed: 08/2026", "confidence": 0.90, "bbox": [50, 400, 200, 25]},
            {"text": "Consumer Care: 1800-123-4567", "confidence": 0.93, "bbox": [50, 500, 350, 25]},
            {"text": "Country of Origin: India", "confidence": 0.92, "bbox": [50, 550, 300, 25]},
        ]

    # Test 4: Field Extraction
    print("\n--- Test 4: Field Extraction ---")
    try:
        from ai_flow.extraction.field_extractor import FieldExtractor

        extractor = FieldExtractor()
        fields = extractor.extract_from_ocr(ocr_results)

        print(f"[OK] Field extraction completed")
        print(f"  Found {len(fields)} fields:")
        for name, field in fields.items():
            print(f"    - {name}: {field.value} (conf: {field.confidence:.2f})")

        # Verify evidence mapping
        all_have_evidence = all(
            field.bbox and field.confidence > 0 and field.source_text
            for field in fields.values()
        )

        if all_have_evidence:
            print(f"[OK] All fields have evidence (bbox, confidence, source_text)")
        else:
            print(f"[WARN] Some fields missing evidence")

    except Exception as e:
        print(f"[ERROR] Field extraction failed: {e}")
        return False

    # Test 5: Full Pipeline
    print("\n--- Test 5: Full Pipeline ---")
    if ocr_available:
        try:
            from ai_flow.pipeline.scan_pipeline import run_pipeline

            result = run_pipeline(image_bytes, scan_id="TEST-REAL-001")

            print(f"[OK] Full pipeline completed")
            print(f"  Image quality: usable={result.image_quality.usable}")
            print(f"  Package detected: {result.package_detection.detected}")
            print(f"  OCR items: {len(result.ocr)}")
            print(f"  Fields: {len(result.fields)}")
            print(f"  Errors: {len(result.errors)}")
            print(f"  Warnings: {len(result.warnings)}")

            return True
        except Exception as e:
            print(f"[ERROR] Full pipeline failed: {e}")
            return False
    else:
        print("[SKIP] Full pipeline requires OCR dependencies")

    return True


def main():
    """Run the real image test."""
    success = test_with_real_image()

    print("\n" + "="*60)
    print("Test Result:", "[PASS]" if success else "[FAIL]")
    print("="*60)
    return success


if __name__ == "__main__":
    main()