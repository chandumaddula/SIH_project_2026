from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_auth_login_multi_role():
    response = client.post("/api/v1/auth/login", json={
        "identifier": "emp-101",
        "password": "password123",
        "personType": "employee"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_dashboard_employee_summary():
    response = client.get("/api/v1/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "stats" in data
    assert "actionItems" in data
    assert "complianceOverview" in data

def test_dashboard_stats():
    response = client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["totalInspections"] >= 1

def test_inspections_start_workflow():
    response = client.post("/api/v1/inspections/start", json={
        "product_name": "Test Biscuits",
        "category": "Food",
        "location": "Central Market"
    })
    assert response.status_code == 201
    data = response.json()
    assert "session_id" in data
    assert data["step"] == "analysis"

def test_complaints_list_and_create():
    response = client.post("/api/v1/complaints", json={
        "product_name": "Test Oil",
        "issue_type": "MRP Discrepancy",
        "description": "Printed price higher than market price",
        "evidence_urls": []
    })
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "NEW"
