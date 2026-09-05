import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_summary_report():
    response = client.get("/api/v1/reports/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_products" in data
    assert "total_inspections" in data
    assert "total_complaints" in data
    assert "total_violations" in data
    assert "compliance_rate_percentage" in data

def test_inspection_report():
    insp_res = client.post("/api/v1/inspections", json={"product_id": "REPORT-TEST-PROD"})
    inspection_id = insp_res.json()["id"]

    response = client.get(f"/api/v1/reports/inspection/{inspection_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["inspection_id"] == inspection_id
    assert data["product_id"] == "REPORT-TEST-PROD"

def test_inspection_pdf_and_notice_generation():
    insp_res = client.post("/api/v1/inspections", json={"product_id": "PDF-NOTICE-PROD"})
    inspection_id = insp_res.json()["id"]

    # Test PDF Report HTML stream
    pdf_res = client.get(f"/api/v1/reports/inspection/{inspection_id}/pdf")
    assert pdf_res.status_code == 200
    assert "Official Inspection Certificate" in pdf_res.text

    # Test Statutory Legal Notice HTML stream
    notice_res = client.get(f"/api/v1/reports/inspection/{inspection_id}/notice")
    assert notice_res.status_code == 200
    assert "NOTICE OF STATUTORY NON-COMPLIANCE" in notice_res.text
    assert "Legal Metrology Act, 2009" in notice_res.text

def test_nonexistent_inspection_report():
    response = client.get("/api/v1/reports/inspection/999999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Inspection report not found"
