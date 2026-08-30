import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_and_get_product():
    payload = {
        "product_name": "Test Milk Bottle 1L",
        "category": "Dairy",
        "brand_name": "Fresh Dairy Co",
        "mrp": 65.0,
        "net_quantity": "1 L",
        "manufacturer_name": "Fresh Dairy Ltd",
        "manufacturer_address": "123 Dairy Lane, Sector 4",
        "consumer_care": "care@freshdairy.com"
    }

    # Create Product
    response = client.post("/api/v1/products", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["product_name"] == payload["product_name"]
    assert data["mrp"] == 65.0
    product_id = data["id"]

    # Get Product by ID
    get_res = client.get(f"/api/v1/products/{product_id}")
    assert get_res.status_code == 200
    assert get_res.json()["category"] == "Dairy"

def test_list_products_filter():
    response = client.get("/api/v1/products?category=Dairy")
    assert response.status_code == 200
    products = response.json()
    assert isinstance(products, list)
    for p in products:
        assert p["category"] == "Dairy"

def test_get_nonexistent_product():
    response = client.get("/api/v1/products/999999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"
