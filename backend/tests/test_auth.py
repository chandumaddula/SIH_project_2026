import unittest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestAuthEndpoints(unittest.TestCase):
    def test_health_check(self):
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")

    def test_root_endpoint(self):
        response = client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("status", response.json())

if __name__ == "__main__":
    unittest.main()
