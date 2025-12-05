import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_greeting):
    response = client.post("/api/greeting")
    assert response.status_code == 200
    assert response.json()["greeting"] == "Hello World"
