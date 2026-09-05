"""
Backend integration test for AI Flow.
Tests that the backend can use the AI Flow pipeline.
"""
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_backend_integration():
    """Test that the backend can integrate with AI Flow."""
    print("="*60)
    print("Backend Integration Test")
    print("="*60)

    # Test 1: Verify AI Flow can be imported from backend context
    print("\n--- Test 1: Import AI Flow from Backend Context ---")
    try:
        from ai_flow.pipeline.scan_pipeline import run_pipeline, AIFieldExtractionPipeline
        from ai_flow.ocr.ocr_engine import OCR
        from ai_flow.extraction.field_extractor import FieldExtractor
        print("[OK] AI Flow modules imported successfully")
    except ImportError as e:
        print(f"[ERROR] Failed to import AI Flow: {e}")
        return False

    # Test 2: Verify AI Flow integrates with ocr_service
    print("\n--- Test 2: OCR Service Integration ---")
    try:
        # Simulate the backend ocr_service module's usage
        from PIL import Image, ImageDraw, ImageFont
        import io

        # Create a real test image
        img = Image.new('RGB', (600, 300), color='white')
        draw = ImageDraw.Draw(img)
        try:
            font = ImageFont.truetype('arial.ttf', 32)
        except:
            font = ImageFont.load_default()

        draw.text((20, 30), 'Test Product', fill='black', font=font)
        draw.text((20, 80), 'Net Qty: 500g', fill='black', font=font)
        draw.text((20, 130), 'MRP Rs 100', fill='black', font=font)

        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes = img_bytes.getvalue()

        # Use AI Flow OCR
        from ai_flow.ocr.ocr_engine import OCR
        ocr = OCR(use_gpu=False)
        results = ocr.detect_text(img_bytes)

        print(f"[OK] OCR returned {len(results)} text items")
        for r in results:
            print(f"  - {r['text']} (conf: {r['confidence']:.2f})")

    except Exception as e:
        print(f"[ERROR] OCR integration failed: {e}")
        return False

    # Test 3: Verify field extraction works on OCR results
    print("\n--- Test 3: Field Extraction from OCR ---")
    try:
        from ai_flow.extraction.field_extractor import FieldExtractor

        extractor = FieldExtractor()
        fields = extractor.extract_from_ocr(results)

        print(f"[OK] Extracted {len(fields)} fields")
        for name, field in fields.items():
            print(f"  - {name}: {field.value} (conf: {field.confidence:.2f})")
            # Verify evidence is preserved
            if not field.source_text or not field.bbox:
                print(f"  [WARN] Missing evidence for {name}")

    except Exception as e:
        print(f"[ERROR] Field extraction failed: {e}")
        return False

    # Test 4: Verify backend can call AI pipeline
    print("\n--- Test 4: Backend AI Pipeline Call ---")
    try:
        # This simulates how scan_service.run_ai_pipeline would work
        result = run_pipeline(img_bytes, scan_id="BACKEND-TEST-001")

        print(f"[OK] Pipeline completed")
        print(f"  Image quality: {result.image_quality.usable}")
        print(f"  Package detected: {result.package_detection.detected}")
        print(f"  OCR items: {len(result.ocr)}")
        print(f"  Fields: {len(result.fields)}")

        # Verify response is JSON-serializable
        import json
        json_data = result.model_dump()
        json_str = json.dumps(json_data)
        print(f"[OK] Response is JSON-serializable ({len(json_str)} bytes)")

    except Exception as e:
        print(f"[ERROR] Pipeline call failed: {e}")
        return False

    # Test 5: Verify pipeline output structure
    print("\n--- Test 5: Output Structure Validation ---")
    try:
        # Check expected fields in result
        required_attrs = ['scan_id', 'image_quality', 'package_detection', 'ocr', 'fields', 'warnings', 'errors']
        for attr in required_attrs:
            if not hasattr(result, attr):
                print(f"[ERROR] Missing attribute: {attr}")
                return False

        # Check image_quality
        if not hasattr(result.image_quality, 'usable'):
            print(f"[ERROR] image_quality missing 'usable'")
            return False
        if not hasattr(result.image_quality, 'quality_score'):
            print(f"[ERROR] image_quality missing 'quality_score'")
            return False

        # Check ocr items
        if result.ocr:
            for item in result.ocr:
                if not all(hasattr(item, attr) for attr in ['text', 'confidence', 'bbox']):
                    print(f"[ERROR] OCR item missing required attributes")
                    return False

        print(f"[OK] Output structure is valid")

    except Exception as e:
        print(f"[ERROR] Output validation failed: {e}")
        return False

    return True


def main():
    """Run integration test."""
    success = test_backend_integration()

    print("\n" + "="*60)
    print("Integration Test Result:", "[PASS]" if success else "[FAIL]")
    print("="*60)
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())