import io
import unittest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.models.user import User, UserRoleEnum
from app.database.session import SessionLocal

client = TestClient(app)

def create_dummy_image(width: int = 400, height: int = 400, fmt: str = "JPEG") -> bytes:
    buf = io.BytesIO()
    img = Image.new("RGB", (width, height), color=(73, 109, 137))
    img.save(buf, format=fmt)
    # Add dummy padding to exceed minimum 1KB size requirement if needed
    data = buf.getvalue()
    if len(data) < 1024:
        data += b"\x00" * (1024 - len(data))
    return data

class TestScanUploadValidation(unittest.TestCase):
    def setUp(self):
        self.db = SessionLocal()
        self.user_id = "test_user_val_123"
        user = self.db.query(User).filter(User.id == self.user_id).first()
        if not user:
            user = User(
                id=self.user_id,
                email="scan_val@example.com",
                hashed_password="hashed_secret_pwd",
                full_name="Scan Validator",
                role=UserRoleEnum.CITIZEN,
            )
            self.db.add(user)
            self.db.commit()
        self.token = create_access_token(subject=self.user_id)

    def tearDown(self):
        self.db.close()

    def test_upload_valid_resolution_jpeg(self):
        img_bytes = create_dummy_image(400, 400, "JPEG")
        response = client.post(
            "/api/v1/scans",
            files={"image": ("package.jpg", io.BytesIO(img_bytes), "image/jpeg")},
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["original_filename"], "package.jpg")

    def test_upload_valid_resolution_png(self):
        img_bytes = create_dummy_image(500, 500, "PNG")
        response = client.post(
            "/api/v1/scans",
            files={"image": ("label.png", io.BytesIO(img_bytes), "image/png")},
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["original_filename"], "label.png")

    def test_upload_low_resolution_image_rejected(self):
        # 100x100 resolution is too small for OCR analysis
        img_bytes = create_dummy_image(100, 100, "JPEG")
        response = client.post(
            "/api/v1/scans",
            files={"image": ("tiny.jpg", io.BytesIO(img_bytes), "image/jpeg")},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("too low for reliable OCR label analysis", response.json()["detail"])

    def test_upload_oversized_file_rejected(self):
        # 11MB payload exceeds 10MB maximum limit
        large_bytes = create_dummy_image(400, 400, "JPEG") + (b"\x00" * (11 * 1024 * 1024))
        response = client.post(
            "/api/v1/scans",
            files={"image": ("large.jpg", io.BytesIO(large_bytes), "image/jpeg")},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("exceeds maximum allowed limit of 10 MB", response.json()["detail"])

    def test_upload_pdf_rejected(self):
        pdf_bytes = b"%PDF-1.4 %AAA\n1 0 obj << /Type /Catalog >> endobj" + b"\x00" * 1024
        response = client.post(
            "/api/v1/scans",
            files={"image": ("document.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Unsupported file extension", response.json()["detail"])

    def test_upload_exe_rejected(self):
        exe_bytes = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00" + b"\x00" * 1024
        response = client.post(
            "/api/v1/scans",
            files={"image": ("program.exe", io.BytesIO(exe_bytes), "application/octet-stream")},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Unsupported file extension", response.json()["detail"])

    def test_upload_zip_rejected(self):
        zip_bytes = b"PK\x03\x04\x14\x00\x08\x00\x08\x00" + b"\x00" * 1024
        response = client.post(
            "/api/v1/scans",
            files={"image": ("archive.zip", io.BytesIO(zip_bytes), "application/zip")},
        )
    def test_unique_filename_generation(self):
        img_bytes1 = create_dummy_image(400, 400, "JPEG")
        img_bytes2 = create_dummy_image(400, 400, "JPEG")

        res1 = client.post(
            "/api/v1/scans",
            headers={"Authorization": f"Bearer {self.token}"},
            files={"image": ("package.jpg", io.BytesIO(img_bytes1), "image/jpeg")},
        )
        res2 = client.post(
            "/api/v1/scans",
            headers={"Authorization": f"Bearer {self.token}"},
            files={"image": ("package.jpg", io.BytesIO(img_bytes2), "image/jpeg")},
        )

        self.assertEqual(res1.status_code, 201)
        self.assertEqual(res2.status_code, 201)

        path1 = res1.json()["image_path"]
        path2 = res2.json()["image_path"]

        # Ensure both preserve original filename "package.jpg" but have unique saved image paths
        self.assertNotEqual(path1, path2)
        self.assertIn("scan_", path1)
        self.assertIn("scan_", path2)

if __name__ == "__main__":
    unittest.main()
