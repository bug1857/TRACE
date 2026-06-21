import io
import json
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import Base, get_db

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

# Helper to load the test CSV file
def get_test_csv_payload():
    csv_path = os.path.join(os.path.dirname(__file__), "test_common.csv")
    with open(csv_path, "rb") as f:
        return f.read()

def test_upload_no_override():
    file_data = get_test_csv_payload()
    response = client.post(
        "/api/ocel/upload",
        files={"file": ("test_common.csv", io.BytesIO(file_data), "text/csv")}
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    result = response.json()
    assert result["columnMapping"]["mappingSource"] == "auto"
    print("\n--- [PASSED] Test 1: Upload with NO override ---")

def test_upload_valid_override():
    file_data = get_test_csv_payload()
    override_dict = {
        "case_id": "case_id",
        "activity": "activity",
        "timestamp": "timestamp",
        "resource": "resource",
        "supplier": None
    }
    response = client.post(
        "/api/ocel/upload",
        files={"file": ("test_common.csv", io.BytesIO(file_data), "text/csv")},
        data={"mapping_override": json.dumps(override_dict)}
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    result = response.json()
    assert result["columnMapping"]["mappingSource"] == "manual"
    assert result["columnMapping"]["case_id"]["confidence"] == 1.0
    assert result["columnMapping"]["activity"]["confidence"] == 1.0
    assert result["columnMapping"]["timestamp"]["confidence"] == 1.0
    assert result["columnMapping"]["resource"]["confidence"] == 1.0
    assert result["columnMapping"]["supplier"]["confidence"] == 0.0
    assert result["columnMapping"]["supplier"]["isResourceFallback"] is True
    assert len(result["nodes"]) > 0
    assert len(result["edges"]) > 0
    print("\n--- [PASSED] Test 2: Upload WITH valid override ---")
    print(json.dumps(result, indent=2))

def test_upload_invalid_override():
    file_data = get_test_csv_payload()
    override_dict = {
        "case_id": "nonexistent_column",
        "activity": "activity",
        "timestamp": "timestamp"
    }
    response = client.post(
        "/api/ocel/upload",
        files={"file": ("test_common.csv", io.BytesIO(file_data), "text/csv")},
        data={"mapping_override": json.dumps(override_dict)}
    )
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    result = response.json()
    assert "detail" in result
    detail = result["detail"]
    assert "case_id" in detail["missing_fields"]
    assert detail["available_columns"] == ["case_id", "activity", "timestamp", "resource"]
    print("\n--- [PASSED] Test 3: Upload WITH invalid override ---")

def test_upload_malformed_override():
    file_data = get_test_csv_payload()
    response = client.post(
        "/api/ocel/upload",
        files={"file": ("test_common.csv", io.BytesIO(file_data), "text/csv")},
        data={"mapping_override": '{"case_id": "case_id", "activity": "activity", ...}'}
    )
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    result = response.json()
    assert "detail" in result
    detail = result["detail"]
    assert detail["error"] == "Invalid mapping_override format"
    print("\n--- [PASSED] Test 4: Upload WITH malformed override ---")

def test_upload_unparseable_timestamp():
    file_data = get_test_csv_payload()
    # Map timestamp to the 'resource' column (which contains Rajesh, Priya, Amit - non-dates)
    override_dict = {
        "case_id": "case_id",
        "activity": "activity",
        "timestamp": "resource"
    }
    response = client.post(
        "/api/ocel/upload",
        files={"file": ("test_common.csv", io.BytesIO(file_data), "text/csv")},
        data={"mapping_override": json.dumps(override_dict)}
    )
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    result = response.json()
    assert "detail" in result
    detail = result["detail"]
    assert detail["error"] == "Column mapped to Timestamp contains no parseable date/time values"
    assert "timestamp" in detail["missing_fields"]
    print("\n--- [PASSED] Test 5: Upload WITH unparseable timestamp column ---")

