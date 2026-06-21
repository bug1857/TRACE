import io
import json
import os
from test_backend import client, TestingSessionLocal
import models

# Standard multi-case CSV dataset that reliably passes auto-detection checks
TEST_CSV_DATA = (
    "case_id,activity,timestamp,resource\n"
    "CASE-001,Order Received,2024-06-20T10:00:00Z,Rajesh\n"
    "CASE-001,Warehouse Pick & Pack,2024-06-20T12:00:00Z,Priya\n"
    "CASE-001,Road Transport Dispatch,2024-06-20T14:30:00Z,Amit\n"
    "CASE-002,Order Received,2024-06-20T10:15:00Z,Rajesh\n"
    "CASE-002,Warehouse Pick & Pack,2024-06-20T13:00:00Z,Priya\n"
    "CASE-002,Road Transport Dispatch,2024-06-20T15:00:00Z,Amit\n"
)

def test_organization_project_workspace_crud():
    # 1. Create Organization
    org_response = client.post("/api/organizations", json={"name": "Louis India Pvt. Ltd."})
    assert org_response.status_code == 201
    org_data = org_response.json()
    assert org_data["name"] == "Louis India Pvt. Ltd."
    org_id = org_data["id"]

    # 2. Get Organizations
    get_orgs = client.get("/api/organizations")
    assert get_orgs.status_code == 200
    assert any(o["id"] == org_id for o in get_orgs.json())

    # 3. Create Project
    proj_response = client.post(f"/api/organizations/{org_id}/projects", json={"name": "Q3 Supply Chain Audit 2024"})
    assert proj_response.status_code == 201
    proj_data = proj_response.json()
    assert proj_data["name"] == "Q3 Supply Chain Audit 2024"
    assert proj_data["org_id"] == org_id
    project_id = proj_data["id"]

    # 4. Get Projects
    get_projects = client.get(f"/api/organizations/{org_id}/projects")
    assert get_projects.status_code == 200
    assert any(p["id"] == project_id for p in get_projects.json())

    # 5. Create Workspace
    ws_response = client.post(f"/api/projects/{project_id}/workspaces", json={"name": "proj-1"})
    assert ws_response.status_code == 201
    ws_data = ws_response.json()
    assert ws_data["name"] == "proj-1"
    assert ws_data["project_id"] == project_id
    workspace_id = ws_data["id"]

    # 6. Get Workspaces
    get_ws = client.get(f"/api/projects/{project_id}/workspaces")
    assert get_ws.status_code == 200
    assert any(w["id"] == workspace_id for w in get_ws.json())

    # Clean up (verify workspace delete endpoint works)
    ws_del = client.delete(f"/api/workspaces/{workspace_id}")
    assert ws_del.status_code == 200
    assert ws_del.json() == {"status": "success"}

    # Project should not have the workspace anymore
    get_ws = client.get(f"/api/projects/{project_id}/workspaces")
    assert len(get_ws.json()) == 0

    # Delete project
    proj_del = client.delete(f"/api/projects/{project_id}")
    assert proj_del.status_code == 200

    # Delete org
    org_del = client.delete(f"/api/organizations/{org_id}")
    assert org_del.status_code == 200

def test_upload_roundtrip_deep_equality():
    # 1. Setup clean Org, Project, Workspace
    org_res = client.post("/api/organizations", json={"name": "Louis India"})
    org_id = org_res.json()["id"]
    proj_res = client.post(f"/api/organizations/{org_id}/projects", json={"name": "Audit 2024"})
    project_id = proj_res.json()["id"]
    ws_res = client.post(f"/api/projects/{project_id}/workspaces", json={"name": "proj-1"})
    workspace_id = ws_res.json()["id"]

    # 2. Upload file with workspace_id
    file_payload = ("test_roundtrip.csv", io.BytesIO(TEST_CSV_DATA.encode("utf-8")), "text/csv")
    
    upload_res = client.post(
        "/api/ocel/upload",
        files={"file": file_payload},
        data={"workspace_id": workspace_id}
    )
    assert upload_res.status_code == 200
    original_payload = upload_res.json()

    # 3. Retrieve latest analysis and assert deep equality
    latest_res = client.get(f"/api/workspaces/{workspace_id}/latest-analysis")
    assert latest_res.status_code == 200
    retrieved_payload = latest_res.json()

    # Ensure PARSED objects are deeply equal
    assert retrieved_payload == original_payload

    # Clean up org
    client.delete(f"/api/organizations/{org_id}")

def test_cascade_deletion():
    # 1. Setup Org -> Project -> Workspace
    org_res = client.post("/api/organizations", json={"name": "Cascade Org"})
    org_id = org_res.json()["id"]
    proj_res = client.post(f"/api/organizations/{org_id}/projects", json={"name": "Cascade Proj"})
    project_id = proj_res.json()["id"]
    ws_res = client.post(f"/api/projects/{project_id}/workspaces", json={"name": "Cascade WS"})
    workspace_id = ws_res.json()["id"]

    # 2. Upload to populate AnalysisSnapshot
    file_payload = ("test_cascade.csv", io.BytesIO(TEST_CSV_DATA.encode("utf-8")), "text/csv")
    
    upload_res = client.post(
        "/api/ocel/upload",
        files={"file": file_payload},
        data={"workspace_id": workspace_id}
    )
    assert upload_res.status_code == 200

    # Verify rows exist in DB directly
    db = TestingSessionLocal()
    try:
        assert db.query(models.Organization).filter(models.Organization.id == org_id).count() == 1
        assert db.query(models.Project).filter(models.Project.id == project_id).count() == 1
        assert db.query(models.Workspace).filter(models.Workspace.id == workspace_id).count() == 1
        assert db.query(models.AnalysisSnapshot).filter(models.AnalysisSnapshot.workspace_id == workspace_id).count() == 1

        # 3. Delete Organization to trigger cascade delete
        del_res = client.delete(f"/api/organizations/{org_id}")
        assert del_res.status_code == 200

        # Verify everything is cascaded deleted
        assert db.query(models.Organization).filter(models.Organization.id == org_id).count() == 0
        assert db.query(models.Project).filter(models.Project.id == project_id).count() == 0
        assert db.query(models.Workspace).filter(models.Workspace.id == workspace_id).count() == 0
        assert db.query(models.AnalysisSnapshot).filter(models.AnalysisSnapshot.workspace_id == workspace_id).count() == 0
    finally:
        db.close()

def test_stateless_upload_regression():
    # Verify uploading without workspace_id succeeds and does not save any snapshot
    db = TestingSessionLocal()
    initial_snapshots_count = db.query(models.AnalysisSnapshot).count()

    file_payload = ("test_stateless.csv", io.BytesIO(TEST_CSV_DATA.encode("utf-8")), "text/csv")
    
    # Upload without workspace_id (form data omitted)
    upload_res = client.post(
        "/api/ocel/upload",
        files={"file": file_payload}
    )
    assert upload_res.status_code == 200
    
    # Ensure no new snapshot is added
    assert db.query(models.AnalysisSnapshot).count() == initial_snapshots_count
    db.close()

def test_latest_analysis_errors():
    # Non-existent workspace should return 404
    res = client.get("/api/workspaces/99999/latest-analysis")
    assert res.status_code == 404
    assert "Workspace not found" in res.text

    # Existing workspace with no analysis should return 404
    org_res = client.post("/api/organizations", json={"name": "Louis India"})
    org_id = org_res.json()["id"]
    proj_res = client.post(f"/api/organizations/{org_id}/projects", json={"name": "Audit 2024"})
    project_id = proj_res.json()["id"]
    ws_res = client.post(f"/api/projects/{project_id}/workspaces", json={"name": "proj-empty"})
    workspace_id = ws_res.json()["id"]

    res_empty = client.get(f"/api/workspaces/{workspace_id}/latest-analysis")
    assert res_empty.status_code == 404
    assert "No analysis snapshot found" in res_empty.text

    # Clean up
    client.delete(f"/api/organizations/{org_id}")
