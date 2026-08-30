import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_users():
    response = client.get("/api/v1/users")
    assert response.status_code == 200
    users = response.json()
    assert isinstance(users, list)

def test_get_nonexistent_user():
    response = client.get("/api/v1/users/non-existent-user-id-999")
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"
