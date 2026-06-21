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

# Recreate all tables specifically in test_trace.db
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    print("Health check passed.")

def test_upload_common():
    # CSV 1: Standard column names
    csv_data = (
        "case_id,activity,timestamp,resource\n"
        "CASE-001,Order Received,2024-06-20T10:00:00Z,Rajesh\n"
        "CASE-001,Warehouse Pick & Pack,2024-06-20T12:00:00Z,Priya\n"
        "CASE-001,Road Transport Dispatch,2024-06-20T14:30:00Z,Amit\n"
        "CASE-002,Order Received,2024-06-20T10:15:00Z,Rajesh\n"
        "CASE-002,Warehouse Pick & Pack,2024-06-20T13:00:00Z,Priya\n"
        "CASE-002,Road Transport Dispatch,2024-06-20T15:00:00Z,Amit\n"
    )
    
    file_payload = ("test_common.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")
    response = client.post(
        "/api/ocel/upload",
        files={"file": file_payload}
    )
    
    assert response.status_code == 200, f"Common upload failed: {response.text}"
    result = response.json()
    
    # Assert DFG output checks
    assert "metadata" in result
    assert "nodes" in result
    assert "edges" in result
    assert "columnMapping" in result
    
    assert result["metadata"]["filename"] == "test_common.csv"
    assert result["metadata"]["rowCount"] == 6
    assert result["metadata"]["caseCount"] == 2
    assert result["metadata"]["activityCount"] == 3
    
    # Check mapping confidence
    mapping = result["columnMapping"]
    assert mapping["case_id"]["column"] == "case_id"
    assert mapping["case_id"]["confidence"] >= 0.8
    assert mapping["activity"]["column"] == "activity"
    assert mapping["activity"]["confidence"] >= 0.8
    assert mapping["timestamp"]["column"] == "timestamp"
    assert mapping["timestamp"]["confidence"] >= 0.8
    
    print("\n--- TEST COMMON CSV OUTPUT ---")
    print(json.dumps(result, indent=2))
    
def test_upload_weird():
    # CSV 2: Weird column names
    csv_data = (
        "Order_ID,Status,Created_At,Handled_By\n"
        "Order-100,Received,2024-06-20 10:00:00,Auditor A\n"
        "Order-100,In Transit,2024-06-20 12:30:00,Carrier X\n"
        "Order-100,Delivered,2024-06-20 16:00:00,Carrier X\n"
        "Order-200,Received,2024-06-20 11:00:00,Auditor A\n"
        "Order-200,In Transit,2024-06-20 14:00:00,Carrier Y\n"
        "Order-200,Delivered,2024-06-20 18:30:00,Carrier Y\n"
    )
    
    file_payload = ("test_weird.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")
    response = client.post(
        "/api/ocel/upload",
        files={"file": file_payload}
    )
    
    assert response.status_code == 200, f"Weird upload failed: {response.text}"
    result = response.json()
    
    # Assert DFG output checks
    assert result["metadata"]["filename"] == "test_weird.csv"
    assert result["metadata"]["rowCount"] == 6
    assert result["metadata"]["caseCount"] == 2
    assert result["metadata"]["activityCount"] == 3
    
    # Check mapping mapping matches weird headers
    mapping = result["columnMapping"]
    assert mapping["case_id"]["column"] == "Order_ID"
    assert mapping["case_id"]["confidence"] >= 0.8
    assert mapping["activity"]["column"] == "Status"
    assert mapping["activity"]["confidence"] >= 0.8
    assert mapping["timestamp"]["column"] == "Created_At"
    assert mapping["timestamp"]["confidence"] >= 0.8
    assert mapping["resource"]["column"] == "Handled_By"
    assert mapping["resource"]["confidence"] >= 0.8
    
    print("\n--- TEST WEIRD CSV OUTPUT ---")
    print(json.dumps(result, indent=2))
def test_upload_invalid():
    # CSV 3: Invalid column names (random UUIDs, no repeated values, no dates)
    csv_data = (
        "col_alpha,col_beta,col_gamma\n"
        "6f8b92b6-20bf-4e0c-99a3-5c8e3d64c12a,abc-xyz-123,not-a-timestamp-1\n"
        "4a2c11d8-11cf-4a1c-88b2-4d7e3d64c23b,def-uvw-456,not-a-timestamp-2\n"
        "9f8a33b6-30df-4e2c-77a3-3c8e3d64c34c,ghi-rst-789,not-a-timestamp-3\n"
        "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d,jkl-nop-012,not-a-timestamp-4\n"
    )
    
    file_payload = ("test_invalid.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")
    response = client.post(
        "/api/ocel/upload",
        files={"file": file_payload}
    )
    
    assert response.status_code == 422, f"Expected 422 status code, got {response.status_code}: {response.text}"
    result = response.json()
    
    print("\n--- TEST INVALID CSV OUTPUT ---")
    print(json.dumps(result, indent=2))
    
    # Assert response contains keys (either in root or in 'detail' wrapper)
    if "detail" in result and isinstance(result["detail"], dict):
        target = result["detail"]
    else:
        target = result
        
    assert "error" in target, "Missing 'error' key"
    assert "missing_fields" in target, "Missing 'missing_fields' key"
    assert "detected_mapping" in target, "Missing 'detected_mapping' key"
    assert "available_columns" in target, "Missing 'available_columns' key"

def test_upload_carbon_budget():
    csv_data = (
        "case_id,activity,timestamp,resource\n"
        "CASE-001,Order Received,2024-06-20T10:00:00Z,Rajesh\n"
        "CASE-001,Warehouse Pick & Pack,2024-06-20T12:00:00Z,Priya\n"
        "CASE-001,Road Transport Dispatch,2024-06-20T14:30:00Z,Amit\n"
        "CASE-002,Order Received,2024-06-20T10:15:00Z,Rajesh\n"
        "CASE-002,Warehouse Pick & Pack,2024-06-20T13:00:00Z,Priya\n"
        "CASE-002,Road Transport Dispatch,2024-06-20T15:00:00Z,Amit\n"
    )
    
    file_payload = ("test_common.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")
    response = client.post(
        "/api/ocel/upload",
        files={"file": file_payload}
    )
    
    assert response.status_code == 200, f"Upload failed: {response.text}"
    result = response.json()
    
    print("\n--- TEST CARBON BUDGET OUTPUT ---")
    print(json.dumps(result, indent=2))
    
    # Assert response contains keys
    assert "carbonBudget" in result
    assert "totalCarbonKg" in result
    assert "activityCarbonBreakdown" in result
    
    # Check values
    assert result["totalCarbonKg"] == 2.94
    
    # Check monthly budget
    budget_list = result["carbonBudget"]
    assert len(budget_list) == 1
    assert budget_list[0]["month"] == "Jun 2024"
    assert budget_list[0]["budget"] == 10000.0
    assert budget_list[0]["actual"] == 2.94
    assert budget_list[0]["delta"] == -9997.06
    assert budget_list[0]["status"] == "pass"
    
    # Check activity breakdown
    breakdown = result["activityCarbonBreakdown"]
    assert len(breakdown) == 3
    
    # Sort breakdown by activity name to make assertion order-independent
    sorted_breakdown = sorted(breakdown, key=lambda x: x["activity"])
    
    # Order Received
    assert sorted_breakdown[0]["activity"] == "Order Received"
    assert sorted_breakdown[0]["category"] == "uncategorized"
    assert sorted_breakdown[0]["estimated"] is True
    assert sorted_breakdown[0]["frequency"] == 2
    assert sorted_breakdown[0]["totalCarbon"] == 1.0
    
    # Road Transport Dispatch
    assert sorted_breakdown[1]["activity"] == "Road Transport Dispatch"
    assert sorted_breakdown[1]["category"] == "road_transport"
    assert sorted_breakdown[1]["estimated"] is False
    assert sorted_breakdown[1]["frequency"] == 2
    assert sorted_breakdown[1]["totalCarbon"] == 1.7
    
    # Warehouse Pick & Pack
    assert sorted_breakdown[2]["activity"] == "Warehouse Pick & Pack"
    assert sorted_breakdown[2]["category"] == "warehouse"
    assert sorted_breakdown[2]["estimated"] is False
    assert sorted_breakdown[2]["frequency"] == 2
    assert sorted_breakdown[2]["totalCarbon"] == 0.24

def test_upload_conformance_with_violations():
    csv_data = (
        "case_id,activity,timestamp,resource,weight\n"
        "CASE-001,Order Received,2024-06-20T10:00:00Z,Rajesh,100\n"
        "CASE-001,Warehouse Pick & Pack,2024-06-20T12:00:00Z,Priya,100\n"
        "CASE-001,Air Freight Dispatch,2024-06-20T14:30:00Z,Amit,100\n"
        "CASE-002,Order Received,2024-06-20T10:15:00Z,Rajesh,100\n"
        "CASE-002,Warehouse Pick & Pack,2024-06-20T13:00:00Z,Priya,100\n"
        "CASE-002,Road Transport Dispatch,2024-06-20T15:00:00Z,Amit,100\n"
    )
    file_payload = ("test_violation.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")
    response = client.post(
        "/api/ocel/upload",
        files={"file": file_payload}
    )
    assert response.status_code == 200, f"Upload failed: {response.text}"
    result = response.json()
    
    assert "violations" in result
    violations = result["violations"]
    assert len(violations) > 0, "Expected at least one violation"
    
    v = violations[0]
    # Check shape
    required_keys = [
        "id", "caseId", "activity", "mandatedAlternative", 
        "category", "severity", "carbonDeltaKg", "estimated", "timestamp"
    ]
    for key in required_keys:
        assert key in v, f"Missing key {key} in violation object"
        
    assert v["caseId"] == "CASE-001"
    assert "air freight" in v["activity"].lower()
    assert v["mandatedAlternative"] == "rail freight"
    assert v["category"] == "transport"
    assert v["estimated"] is True

def test_upload_conformance_no_violations():
    csv_data = (
        "case_id,activity,timestamp,resource\n"
        "CASE-001,Order Received,2024-06-20T10:00:00Z,Rajesh\n"
        "CASE-001,Warehouse Pick & Pack,2024-06-20T12:00:00Z,Priya\n"
        "CASE-001,Road Transport Dispatch,2024-06-20T14:30:00Z,Amit\n"
        "CASE-002,Order Received,2024-06-20T10:15:00Z,Rajesh\n"
        "CASE-002,Warehouse Pick & Pack,2024-06-20T13:00:00Z,Priya\n"
        "CASE-002,Road Transport Dispatch,2024-06-20T15:00:00Z,Amit\n"
    )
    file_payload = ("test_no_violation.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")
    response = client.post(
        "/api/ocel/upload",
        files={"file": file_payload}
    )
    assert response.status_code == 200, f"Upload failed: {response.text}"
    result = response.json()
    
    assert "violations" in result
    assert result["violations"] == []

def test_upload_carbon_fitness_with_violations():
    csv_data = (
        "case_id,activity,timestamp,resource,supplier_name,weight\n"
        "CASE-001,Order Received,2024-06-20T10:00:00Z,Rajesh,Supplier Alpha,100\n"
        "CASE-001,Warehouse Pick & Pack,2024-06-20T12:00:00Z,Priya,Supplier Alpha,100\n"
        "CASE-001,Air Freight Dispatch,2024-06-20T14:30:00Z,Amit,Supplier Alpha,100\n"
        "CASE-002,Order Received,2024-06-20T10:15:00Z,Rajesh,Supplier Beta,100\n"
        "CASE-002,Warehouse Pick & Pack,2024-06-20T13:00:00Z,Priya,Supplier Beta,100\n"
        "CASE-002,Road Transport Dispatch,2024-06-20T15:00:00Z,Amit,Supplier Beta,100\n"
    )
    file_payload = ("test_violation_fit.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")
    response = client.post(
        "/api/ocel/upload",
        files={"file": file_payload}
    )
    assert response.status_code == 200, f"Upload failed: {response.text}"
    result = response.json()
    
    assert "cfsScores" in result
    assert "supplierFitness" in result
    
    cfs = result["cfsScores"]
    supplier = result["supplierFitness"]
    
    assert len(cfs) == 2
    # Verify shape of cfs
    required_cfs_keys = ["caseId", "actualCarbonKg", "idealCarbonKg", "cfsScore", "violationCount"]
    for key in required_cfs_keys:
        assert key in cfs[0]
        
    cfs_dict = {r["caseId"]: r["cfsScore"] for r in cfs}
    assert cfs_dict["CASE-001"] < 100.0
    assert cfs_dict["CASE-002"] == 100.0
    
    assert len(supplier) == 2
    required_sup_keys = ["supplier", "totalCarbonKg", "violationCount", "avgCfsScore", "caseCount", "isResourceFallback"]
    for key in required_sup_keys:
        assert key in supplier[0]
        
    assert supplier[0]["isResourceFallback"] is False
    assert supplier[0]["avgCfsScore"] >= supplier[1]["avgCfsScore"]

def test_upload_carbon_fitness_no_violations():
    csv_data = (
        "case_id,activity,timestamp,resource,supplier_name\n"
        "CASE-001,Order Received,2024-06-20T10:00:00Z,Rajesh,Supplier Alpha\n"
        "CASE-001,Warehouse Pick & Pack,2024-06-20T12:00:00Z,Priya,Supplier Alpha\n"
        "CASE-001,Road Transport Dispatch,2024-06-20T14:30:00Z,Amit,Supplier Alpha\n"
        "CASE-002,Order Received,2024-06-20T10:15:00Z,Rajesh,Supplier Beta\n"
        "CASE-002,Warehouse Pick & Pack,2024-06-20T13:00:00Z,Priya,Supplier Beta\n"
        "CASE-002,Road Transport Dispatch,2024-06-20T15:00:00Z,Amit,Supplier Beta\n"
    )
    file_payload = ("test_no_violation_fit.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")
    response = client.post(
        "/api/ocel/upload",
        files={"file": file_payload}
    )
    assert response.status_code == 200, f"Upload failed: {response.text}"
    result = response.json()
    
    assert "cfsScores" in result
    assert "supplierFitness" in result
    
    cfs = result["cfsScores"]
    supplier = result["supplierFitness"]
    
    for r in cfs:
        assert r["cfsScore"] == 100.0
        
    assert len(supplier) == 2
    assert supplier[0]["avgCfsScore"] == 100.0
    assert supplier[1]["avgCfsScore"] == 100.0

def test_audit_logs():
    payload1 = {
        "action_type": "REQUEST_CORRECTIVE_ACTION",
        "target": "Supplier E",
        "details": "Details E"
    }
    response1 = client.post("/api/audit-logs", json=payload1)
    assert response1.status_code == 201
    res1 = response1.json()
    assert "id" in res1
    assert "timestamp" in res1
    assert res1["action_type"] == "REQUEST_CORRECTIVE_ACTION"
    assert res1["target"] == "Supplier E"
    assert res1["details"] == "Details E"

    payload2 = {
        "action_type": "RUN_SIMULATION",
        "target": "Scenario A",
        "details": "Details A"
    }
    response2 = client.post("/api/audit-logs", json=payload2)
    assert response2.status_code == 201
    res2 = response2.json()

    response_get = client.get("/api/audit-logs")
    assert response_get.status_code == 200
    logs = response_get.json()
    assert len(logs) >= 2
    assert logs[0]["action_type"] == "RUN_SIMULATION"
    assert logs[0]["target"] == "Scenario A"
    assert logs[1]["action_type"] == "REQUEST_CORRECTIVE_ACTION"
    assert logs[1]["target"] == "Supplier E"

def test_upload_tie_breaking_fallback():
    # CSV with two generic columns that have identical cardinality shape (3 unique values over 6 rows each)
    # and no header aliases.
    csv_data = (
        "random_col_a,random_col_b,random_col_c\n"
        "C1,Order Received,2026-06-20T23:00:00Z\n"
        "C1,Packaging,2026-06-20T23:05:00Z\n"
        "C2,Order Received,2026-06-20T23:10:00Z\n"
        "C2,Quality Inspection,2026-06-20T23:15:00Z\n"
        "C3,Order Received,2026-06-20T23:20:00Z\n"
        "C3,Packaging,2026-06-20T23:25:00Z\n"
    )
    file_payload = ("test_tie.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")
    response = client.post(
        "/api/ocel/upload",
        files={"file": file_payload}
    )
    
    assert response.status_code == 422, f"Expected 422 status code, got {response.status_code}: {response.text}"
    result = response.json()
    
    if "detail" in result and isinstance(result["detail"], dict):
        target = result["detail"]
    else:
        target = result
        
    assert "error" in target, "Missing 'error' key"
    assert "case_id" in target["missing_fields"], "Expected 'case_id' in missing_fields due to tie-breaking cap"
    assert target["detected_mapping"]["case_id"]["confidence"] == 0.3

def test_upload_process_optimization():
    # Read the CSV from fixture file
    import os
    fixture_path = os.path.join("backend", "tests", "fixtures", "process_opt_fixture.csv")
    if not os.path.exists(fixture_path):
        fixture_path = os.path.join("tests", "fixtures", "process_opt_fixture.csv")
        
    with open(fixture_path, "rb") as f:
        file_payload = ("process_opt_fixture.csv", f.read(), "text/csv")
        
    response = client.post(
        "/api/ocel/upload",
        files={"file": file_payload}
    )
    
    assert response.status_code == 200, f"Upload failed: {response.text}"
    result = response.json()
    
    # Assert response contains "processOptimization"
    assert "processOptimization" in result, "Missing 'processOptimization' in upload response"
    
    po = result["processOptimization"]
    
    # Assert po has all 4 keys: bottlenecks, rework, caseDurationDistribution, totalCasesAnalyzed
    assert "bottlenecks" in po, "Missing 'bottlenecks' in processOptimization"
    assert "rework" in po, "Missing 'rework' in processOptimization"
    assert "caseDurationDistribution" in po, "Missing 'caseDurationDistribution' in processOptimization"
    assert "totalCasesAnalyzed" in po, "Missing 'totalCasesAnalyzed' in processOptimization"
    
    # Assert totalCasesAnalyzed matches the fixture's actual case count (3)
    assert po["totalCasesAnalyzed"] == 3, f"Expected 3 cases analyzed, got {po['totalCasesAnalyzed']}"
    
    # Extra check: Rework for 'Warehouse Pick & Pack' should be detected since CASE-001 has it twice
    rework_list = po["rework"]
    warehouse_rework = next((r for r in rework_list if r["activity"] == "Warehouse Pick & Pack"), None)
    assert warehouse_rework is not None, "Expected Warehouse Pick & Pack in rework list"
    assert warehouse_rework["reworkCount"] == 1, f"Expected 1 rework count for Warehouse Pick & Pack, got {warehouse_rework['reworkCount']}"
    
    print("\n--- TEST UPLOAD PROCESS OPTIMIZATION OUTPUT ---")
    print(json.dumps(po, indent=2))

if __name__ == "__main__":
    test_health()
    test_upload_common()
    test_upload_weird()
    test_upload_invalid()
    test_upload_tie_breaking_fallback()
    test_upload_carbon_budget()
    test_upload_conformance_with_violations()
    test_upload_conformance_no_violations()
    test_upload_carbon_fitness_with_violations()
    test_upload_carbon_fitness_no_violations()
    test_upload_process_optimization()
    test_audit_logs()
    print("\nAll backend tests passed successfully!")

