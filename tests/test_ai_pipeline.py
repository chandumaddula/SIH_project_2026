import unittest
from ai.ocr.detector import OCRDetector
from ai.extraction.parser import DeclarationExtractor

class TestAIPipeline(unittest.TestCase):
    def test_ocr_and_extraction(self):
        detector = OCRDetector()
        extractor = DeclarationExtractor()
        results = detector.detect_text(b"fake_image")
        declarations = extractor.extract_declarations(results)
        self.assertIn("MRP", declarations)
        self.assertIn("NET_QUANTITY", declarations)

if __name__ == '__main__':
    unittest.main()
