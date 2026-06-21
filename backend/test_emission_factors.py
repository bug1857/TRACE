import io
import json
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import Base, get_db
import models

# Isolated test database config
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_trace.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

# Drop and recreate tables to ensure isolation
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def test_get_empty_overrides():
    # 1. Ensure DB is empty
    db = TestingSessionLocal()
    db.query(models.EmissionFactorOverride).delete()
    db.commit()
    db.close()

    response = client.get("/api/emission-factors")
    assert response.status_code == 200
    assert response.json() == {}
    print("\n--- [PASSED] GET empty overrides returns {} ---")

def test_post_get_roundtrip():
    # 1. Post overrides
    payload = {
        "air_freight": 5.24,
        "road_transport": 1.70
    }
    response = client.post("/api/emission-factors", json=payload)
    assert response.status_code == 200
    assert response.json() == {"status": "success"}

    # 2. Get overrides and check
    response = client.get("/api/emission-factors")
    assert response.status_code == 200
    data = response.json()
    assert data["air_freight"] == 5.24
    assert data["road_transport"] == 1.70
    print("\n--- [PASSED] POST then GET round-trips correctly ---")

def test_upload_regression_no_overrides():
    # 1. Clear overrides so we use default calculation factors
    db = TestingSessionLocal()
    db.query(models.EmissionFactorOverride).delete()
    db.commit()
    db.close()

    # 2. Load trace_demo_dataset.csv from root folder
    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "trace_demo_dataset.csv"))
    with open(csv_path, "rb") as f:
        file_payload = ("trace_demo_dataset.csv", f.read(), "text/csv")

    response = client.post(
        "/api/ocel/upload",
        files={"file": file_payload}
    )
    assert response.status_code == 200, f"Upload failed: {response.text}"
    result = response.json()
    assert result["totalCarbonKg"] == 3003.8, f"Expected default baseline total 3003.8, got {result['totalCarbonKg']}"
    print("\n--- [PASSED] Upload without overrides matches baseline (3003.8 kg) ---")

def test_upload_with_overrides():
    # 1. Set override for air_freight (double to 5.24)
    payload = {
        "air_freight": 5.24
    }
    response = client.post("/api/emission-factors", json=payload)
    assert response.status_code == 200

    # 2. Load trace_demo_dataset.csv from root folder
    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "trace_demo_dataset.csv"))
    with open(csv_path, "rb") as f:
        file_payload = ("trace_demo_dataset.csv", f.read(), "text/csv")

    response = client.post(
        "/api/ocel/upload",
        files={"file": file_payload}
    )
    assert response.status_code == 200, f"Upload failed: {response.text}"
    result = response.json()
    
    # Baseline was 3003.8. There are 140 air_freight events. 
    # Doubling air_freight factor from 2.62 to 5.24 adds 140 * 2.62 = 366.8.
    # Expected: 3003.8 + 366.8 = 3370.6
    assert result["totalCarbonKg"] == 3370.6, f"Expected overridden total 3370.6, got {result['totalCarbonKg']}"
    print("\n--- [PASSED] Upload with overrides matches expected change (3370.6 kg) ---")
