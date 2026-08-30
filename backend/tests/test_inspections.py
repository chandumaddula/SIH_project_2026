import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_and_list_inspections():
    payload = {
        "product_id": "PROD-101",
        "location": "Central Supermarket Store #5",
        "remarks": "Initial routine check"
    }

    # Create Inspection
    response = client.post("/api/v1/inspections", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["product_id"] == "PROD-101"
    assert data["status"] == "PENDING"
    inspection_id = data["id"]

    # List Inspections
    list_res = client.get("/api/v1/inspections")
    assert list_res.status_code == 200
    inspections = list_res.json()
    assert isinstance(inspections, list)
    assert any(i["id"] == inspection_id for i in inspections)
