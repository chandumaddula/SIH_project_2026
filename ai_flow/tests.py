"""
Unit tests for AI Flow pipeline.
Run with: python -m unittest ai_flow/tests.py
"""
import unittest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestAIFlowImports(unittest.TestCase):
    """Test that all AI Flow modules can be imported."""

    def test_config_import(self):
        from ai_flow import config
        self.assertTrue(hasattr(config, 'OCR_ENGINE'))
        self.assertIn(config.OCR_ENGINE, ["easyocr", "paddleocr", "tesseract"])

    def test_preprocessing_import(self):
        from ai_flow.preprocessing.image_preprocessor import ImagePreprocessor
        self.assertTrue(hasattr(ImagePreprocessor, 'validate_and_preprocess'))

    def test_detection_import(self):
        from ai_flow.detection.package_detector import PackageDetector
        self.assertTrue(hasattr(PackageDetector, 'detect_package_region'))

    def test_extraction_import(self):
        from ai_flow.extraction.field_extractor import FieldExtractor
        self.assertTrue(hasattr(FieldExtractor, 'extract_from_ocr'))

    def test_schemas_import(self):
        from ai_flow.schemas.result import ScanResponse, OCRTextItem
        self.assertTrue(ScanResponse)
        self.assertTrue(OCRTextItem)

    def test_pipeline_import(self):
        from ai_flow.pipeline.scan_pipeline import AIFieldExtractionPipeline
        self.assertTrue(hasattr(AIFieldExtractionPipeline, 'process_image'))


class TestFieldExtraction(unittest.TestCase):
    """Test field extraction from OCR results."""

    def setUp(self):
        from ai_flow.extraction.field_extractor import FieldExtractor
        self.extractor = FieldExtractor()

    def test_extract_product_name(self):
        ocr = [{"text": "ABC PREMIUM RICE", "confidence": 0.98, "bbox": [50, 30, 400, 50]}]
        fields = self.extractor.extract_from_ocr(ocr)
        self.assertIn("product_name", fields)
        self.assertEqual(fields["product_name"].value, "ABC PREMIUM RICE")

    def test_extract_mrp(self):
        ocr = [{"text": "MRP Rs. 120 (Incl. of all taxes)", "confidence": 0.96, "bbox": [50, 200, 250, 30]}]
        fields = self.extractor.extract_from_ocr(ocr)
        self.assertIn("mrp", fields)
        self.assertEqual(fields["mrp"].value, 120.0)
        self.assertEqual(fields["mrp"].currency, "INR")

    def test_extract_net_quantity(self):
        ocr = [{"text": "Net Quantity: 1 kg", "confidence": 0.97, "bbox": [50, 200, 300, 30]}]
        fields = self.extractor.extract_from_ocr(ocr)
        self.assertIn("net_quantity", fields)
        self.assertEqual(fields["net_quantity"].value, 1.0)
        self.assertEqual(fields["net_quantity"].unit, "kg")

    def test_extract_manufacturer(self):
        ocr = [{"text": "Manufactured by ABC Foods Pvt Ltd", "confidence": 0.95, "bbox": [50, 100, 500, 30]}]
        fields = self.extractor.extract_from_ocr(ocr)
        self.assertIn("manufacturer", fields)
        self.assertEqual(fields["manufacturer"].value, "ABC Foods Pvt Ltd")

    def test_extract_consumer_care(self):
        ocr = [{"text": "Consumer Care 1800-123-4567", "confidence": 0.93, "bbox": [50, 500, 350, 25]}]
        fields = self.extractor.extract_from_ocr(ocr)
        self.assertIn("consumer_care", fields)
        self.assertIn("1800-123-4567", fields["consumer_care"].value)

    def test_evidence_preservation(self):
        """Verify that bbox, confidence, and source_text are preserved."""
        ocr = [{"text": "Net Quantity: 500 g", "confidence": 0.97, "bbox": [50, 200, 300, 30]}]
        fields = self.extractor.extract_from_ocr(ocr)
        self.assertIn("net_quantity", fields)
        field = fields["net_quantity"]
        self.assertEqual(field.bbox, [50, 200, 300, 30])
        self.assertEqual(field.confidence, 0.97)
        self.assertIn("Net Quantity", field.source_text)

    def test_serialization(self):
        """Test that fields can be serialized to JSON."""
        ocr = [{"text": "MRP Rs. 100", "confidence": 0.95, "bbox": [10, 20, 100, 30]}]
        fields = self.extractor.extract_from_ocr(ocr)
        result = self.extractor.to_serializable_dict(fields)

        # Should be JSON-serializable
        import json
        json_str = json.dumps(result)
        self.assertIsInstance(json_str, str)
        self.assertGreater(len(json_str), 0)


class TestSchemas(unittest.TestCase):
    """Test Pydantic schemas."""

    def test_ocr_text_item(self):
        from ai_flow.schemas.result import OCRTextItem
        item = OCRTextItem(
            text="MRP Rs 120",
            confidence=0.95,
            bbox=[100, 200, 200, 30]
        )
        self.assertEqual(item.text, "MRP Rs 120")
        self.assertEqual(item.confidence, 0.95)

    def test_image_quality_result(self):
        from ai_flow.schemas.result import ImageQualityResult
        result = ImageQualityResult(
            quality_score=0.95,
            usable=True,
            defects=[],
            dimensions={"width": 800, "height": 600}
        )
        self.assertTrue(result.usable)

    def test_package_detection_result(self):
        from ai_flow.schemas.result import PackageDetectionResult
        result = PackageDetectionResult(
            detected=True,
            confidence=0.85,
            bounding_box=[100, 50, 600, 400]
        )
        self.assertTrue(result.detected)

    def test_scan_response_serialization(self):
        from ai_flow.schemas.result import (
            ScanResponse, ImageQualityResult, PackageDetectionResult, OCRTextItem
        )
        response = ScanResponse(
            scan_id="TEST-001",
            image_quality=ImageQualityResult(quality_score=0.9, usable=True),
            package_detection=PackageDetectionResult(detected=True, confidence=0.8),
            ocr=[OCRTextItem(text="Test", confidence=0.9, bbox=[0, 0, 100, 30])]
        )
        json_str = response.model_dump_json()
        self.assertIsInstance(json_str, str)
        self.assertIn("TEST-001", json_str)


if __name__ == "__main__":
    unittest.main()