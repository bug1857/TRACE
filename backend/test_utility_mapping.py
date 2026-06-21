import io
import json
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

def test_upload_no_utility_fields():
    # Synthetic CSV without water/electricity/cost columns
    csv_data = b"""case_id,activity,timestamp,resource
CASE-001,Order Received,2024-06-20T10:00:00Z,Rajesh
CASE-001,Warehouse Pick & Pack,2024-06-20T12:00:00Z,Priya
CASE-002,Order Received,2024-06-20T10:15:00Z,Rajesh
"""
    response = client.post(
        "/api/ocel/upload",
        files={"file": ("test_synthetic.csv", io.BytesIO(csv_data), "text/csv")}
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    result = response.json()
    
    # Confirm columns are None
    assert result["columnMapping"]["water"]["column"] is None
    assert result["columnMapping"]["electricity"]["column"] is None
    assert result["columnMapping"]["cost"]["column"] is None
    
    # Confirm brsrReport values are None
    resource_draw = result["brsrReport"]["sectionC"]["resourceDraw"]
    assert resource_draw["waterLiters"] is None
    assert resource_draw["energyKwh"] is None
    
    # Confirm no new cost key at all
    assert "totalOperationalCostUSD" not in result

def test_upload_with_utility_fields_auto():
    # Synthetic CSV WITH water/electricity/cost columns (auto-detectable)
    csv_data = b"""case_id,activity,timestamp,resource,water_consumption,power_kwh,cost_usd
CASE-001,Order Received,2024-06-20T10:00:00Z,Rajesh,100.5,15.2,50.25
CASE-001,Warehouse Pick & Pack,2024-06-20T12:00:00Z,Priya,200.25,30.3,120.75
CASE-002,Order Received,2024-06-20T10:15:00Z,Rajesh,150.0,20.0,75.0
"""
    # Math check:
    # water_consumption sum: 100.5 + 200.25 + 150.0 = 450.75
    # power_kwh sum: 15.2 + 30.3 + 20.0 = 65.5
    # cost_usd sum: 50.25 + 120.75 + 75.0 = 246.0

    response = client.post(
        "/api/ocel/upload",
        files={"file": ("test_synthetic_utils.csv", io.BytesIO(csv_data), "text/csv")}
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    result = response.json()
    
    # Check mappings
    assert result["columnMapping"]["water"]["column"] == "water_consumption"
    assert result["columnMapping"]["electricity"]["column"] == "power_kwh"
    assert result["columnMapping"]["cost"]["column"] == "cost_usd"
    
    # Check sums in brsrReport
    resource_draw = result["brsrReport"]["sectionC"]["resourceDraw"]
    assert resource_draw["waterLiters"] == 450.75
    assert resource_draw["energyKwh"] == 65.5
    
    # Check cost key
    assert result["totalOperationalCostUSD"] == 246.0

def test_upload_with_utility_fields_manual():
    # Synthetic CSV WITH columns that need manual override mapping
    csv_data = b"""case,act,ts,actor,my_water_col,my_power_col,my_cost_col
CASE-001,Order Received,2024-06-20T10:00:00Z,Rajesh,100.0,10.0,40.0
CASE-001,Warehouse Pick & Pack,2024-06-20T12:00:00Z,Priya,200.0,20.0,80.0
"""
    # Math check:
    # water: 100.0 + 200.0 = 300.0
    # electricity: 10.0 + 20.0 = 30.0
    # cost: 40.0 + 80.0 = 120.0

    override_dict = {
        "case_id": "case",
        "activity": "act",
        "timestamp": "ts",
        "resource": "actor",
        "water": "my_water_col",
        "electricity": "my_power_col",
        "cost": "my_cost_col"
    }

    response = client.post(
        "/api/ocel/upload",
        files={"file": ("test_synthetic_manual.csv", io.BytesIO(csv_data), "text/csv")},
        data={"mapping_override": json.dumps(override_dict)}
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    result = response.json()
    
    # Check mapping
    assert result["columnMapping"]["water"]["column"] == "my_water_col"
    assert result["columnMapping"]["electricity"]["column"] == "my_power_col"
    assert result["columnMapping"]["cost"]["column"] == "my_cost_col"
    
    # Check sums in brsrReport
    resource_draw = result["brsrReport"]["sectionC"]["resourceDraw"]
    assert resource_draw["waterLiters"] == 300.0
    assert resource_draw["energyKwh"] == 30.0
    
    # Check cost key
    assert result["totalOperationalCostUSD"] == 120.0
