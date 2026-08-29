import unittest
from datetime import datetime
from app.schemas.scan import ScanResponse, ScanListItem
from app.models.scan import ScanStatusEnum

class TestScanSchemas(unittest.TestCase):
    def test_scan_list_item_schema(self):
        data = {
            "id": 1,
            "user_id": "usr_12345",
            "original_filename": "biscuit.jpg",
            "image_path": "/static/scans/scan_1234.jpg",
            "file_type": "image/jpeg",
            "file_size": 204800,
            "status": "PENDING",
            "created_at": "2026-08-29T12:30:00"
        }
        item = ScanListItem.model_validate(data)
        self.assertEqual(item.id, 1)
        self.assertEqual(item.original_filename, "biscuit.jpg")
        self.assertEqual(item.status, ScanStatusEnum.PENDING)
        
        json_output = item.model_dump_json()
        self.assertIn('"original_filename":"biscuit.jpg"', json_output)
        self.assertIn('"status":"PENDING"', json_output)

    def test_scan_response_schema(self):
        data = {
            "id": 1,
            "user_id": "usr_12345",
            "original_filename": "biscuit.jpg",
            "image_path": "/static/scans/scan_1234.jpg",
            "file_type": "image/jpeg",
            "file_size": 204800,
            "status": "COMPLETED",
            "created_at": "2026-08-29T12:30:00",
            "updated_at": "2026-08-29T12:30:05"
        }
        resp = ScanResponse.model_validate(data)
        self.assertEqual(resp.id, 1)
        self.assertEqual(resp.status, ScanStatusEnum.COMPLETED)

if __name__ == "__main__":
    unittest.main()
