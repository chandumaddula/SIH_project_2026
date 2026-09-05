import io
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_test_image(width: int = 800, height: int = 800, color=(73, 109, 137)) -> bytes:
    buf = io.BytesIO()
    img = Image.new("RGB", (width, height), color=color)
    draw = ImageDraw.Draw(img)
    # Draw high-contrast text/lines for edge sharpness detection
    for i in range(10, width, 40):
        draw.line([(i, 0), (i, height)], fill=(255, 255, 255), width=3)
    draw.text((50, 50), "LEGAL METROLOGY TEST PACKAGE MRP Rs 240", fill=(255, 255, 255))
    img.save(buf, format="JPEG")
    data = buf.getvalue()
    if len(data) < 1024:
        data += b"\x00" * (1024 - len(data))
    return data

def test_ai_scan_valid_image():
    img_bytes = create_test_image(800, 800)
    response = client.post(
        "/api/v1/ai/scan",
        files={"file": ("product.jpg", io.BytesIO(img_bytes), "image/jpeg")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "scan_id" in data
    assert "image_path" in data
    assert "extracted_declarations" in data
    assert "field_evidences" in data
    assert "rule_engine_screening" in data

def test_ai_scan_low_quality_rejected():
    # 100x100 resolution fails LOW_RESOLUTION check
    img_bytes = create_test_image(100, 100)
    response = client.post(
        "/api/v1/ai/scan",
        files={"file": ("tiny_product.jpg", io.BytesIO(img_bytes), "image/jpeg")},
    )
    assert response.status_code == 400
    detail = response.json()["detail"]
    assert detail["status"] == "QUALITY_REJECTED"
    assert "LOW QUALITY" in detail["message"]
    assert "LOW_RESOLUTION" in detail["defects"]
