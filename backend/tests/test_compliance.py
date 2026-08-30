import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_compliance_check():
    payload = {
        "product_name": "Compliant Oil Can 5L",
        "mrp_present": True,
        "net_quantity_present": True,
        "manufacturer_present": True,
        "consumer_care_present": True
    }
    response = client.post("/api/v1/compliance/check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["overall_status"] == "COMPLIANT"
    assert data["compliance_score"] == 1.0
    assert len(data["violations"]) == 0

def test_non_compliant_check_with_violations():
    # First create an inspection
    insp_res = client.post("/api/v1/inspections", json={"product_id": "PROD-NONCOMPLIANT"})
    assert insp_res.status_code == 201
    inspection_id = insp_res.json()["id"]

    payload = {
        "inspection_id": inspection_id,
        "product_name": "Defective Package",
        "mrp_present": False,
        "net_quantity_present": False,
        "manufacturer_present": True,
        "consumer_care_present": False
    }

    response = client.post("/api/v1/compliance/check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["overall_status"] in ["WARNING", "NON_COMPLIANT"]
    assert len(data["violations"]) == 3

    # Check results by inspection ID
    results_res = client.get(f"/api/v1/compliance/results/{inspection_id}")
    assert results_res.status_code == 200
    res_data = results_res.json()
    assert res_data["inspection_id"] == inspection_id
    assert len(res_data["violations"]) == 3

def test_list_all_violations():
    response = client.get("/api/v1/compliance/violations")
    assert response.status_code == 200
    violations = response.json()
    assert isinstance(violations, list)
