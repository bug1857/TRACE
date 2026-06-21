import os
import json
from test_backend import client

def test_upload_brsr_report():
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
    
    # Assert response contains "brsrReport"
    assert "brsrReport" in result, "Missing 'brsrReport' in upload response"
    
    brsr = result["brsrReport"]
    
    # Assert all keys in the returned BRSR report structure
    assert "header" in brsr, "Missing 'header' in brsrReport"
    assert "executiveSummary" in brsr, "Missing 'executiveSummary' in brsrReport"
    assert "kpiStrip" in brsr, "Missing 'kpiStrip' in brsrReport"
    assert "sectionB" in brsr, "Missing 'sectionB' in brsrReport"
    assert "sectionC" in brsr, "Missing 'sectionC' in brsrReport"
    assert "sectionD_traceabilityMatrix" in brsr, "Missing 'sectionD_traceabilityMatrix' in brsrReport"
    assert "recommendations" in brsr, "Missing 'recommendations' in brsrReport"
