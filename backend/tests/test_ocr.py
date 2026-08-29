import unittest
from app.services.ocr_service import ocr_service

class TestOCRService(unittest.TestCase):
    def test_process_ocr(self):
        res = ocr_service.process_image_ocr("storage/scans/sample.jpg")
        self.assertIn("extracted_text", res)
        self.assertIn("bounding_boxes", res)
        self.assertGreaterEqual(len(res["bounding_boxes"]), 1)

if __name__ == "__main__":
    unittest.main()
