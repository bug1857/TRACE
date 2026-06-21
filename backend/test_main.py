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
    assert "sectionA" in brsr, "Missing 'sectionA' in brsrReport"
    assert "sectionB" in brsr, "Missing 'sectionB' in brsrReport"
    assert "sectionC" in brsr, "Missing 'sectionC' in brsrReport"
    assert "sectionD_traceabilityMatrix" in brsr, "Missing 'sectionD_traceabilityMatrix' in brsrReport"
    assert "recommendations" in brsr, "Missing 'recommendations' in brsrReport"
    
    # Assert response contains "esgReport"
    assert "esgReport" in result, "Missing 'esgReport' in upload response"
    esg = result["esgReport"]
    
    assert "environmental" in esg, "Missing 'environmental' in esgReport"
    assert "social" in esg, "Missing 'social' in esgReport"
    assert "governance" in esg, "Missing 'governance' in esgReport"
    assert "overallScore" in esg, "Missing 'overallScore' in esgReport"

    # Assert response contains "greenRoutes"
    assert "greenRoutes" in result, "Missing 'greenRoutes' in upload response"
    green_routes = result["greenRoutes"]
    assert isinstance(green_routes, list), "greenRoutes must be a list"
    
    # If there are recommendations, verify their structure
    if len(green_routes) > 0:
        rec = green_routes[0]
        assert "id" in rec, "Missing 'id' in greenRoutes recommendation"
        assert "currentRoute" in rec, "Missing 'currentRoute' in greenRoutes recommendation"
        assert "recommendedRoute" in rec, "Missing 'recommendedRoute' in greenRoutes recommendation"
        assert "carbonSaving" in rec, "Missing 'carbonSaving' in greenRoutes recommendation"
        assert "costDelta" in rec, "Missing 'costDelta' in greenRoutes recommendation"
        assert "confidence" in rec, "Missing 'confidence' in greenRoutes recommendation"


from unittest.mock import patch, MagicMock
import urllib.error

def test_copilot_status():
    # Mock successful status response
    mock_response = MagicMock()
    mock_response.status = 200
    mock_response.__enter__.return_value = mock_response
    mock_response.read.return_value = json.dumps({
        "models": [
            {"name": "gemma3:4b"},
            {"name": "qwen2.5:1.5b"}
        ]
    }).encode("utf-8")
    
    with patch("urllib.request.urlopen", return_value=mock_response):
        response = client.get("/api/copilot/status")
        print("STATUS RESPONSE TEXT (SUCCESS):", response.json())
        assert response.status_code == 200
        assert response.json() == {
            "online": True,
            "availableModels": ["gemma3:4b", "qwen2.5:1.5b"]
        }

    # Mock unreachable Ollama (fails with exception)
    with patch("urllib.request.urlopen", side_effect=urllib.error.URLError("Connection refused")):
        response = client.get("/api/copilot/status")
        print("STATUS RESPONSE TEXT (UNREACHABLE):", response.json())
        assert response.status_code == 200
        assert response.json() == {
            "online": False,
            "availableModels": []
        }

def test_copilot_query_success():
    mock_response = MagicMock()
    mock_response.status = 200
    mock_response.__enter__.return_value = mock_response
    mock_response.read.return_value = json.dumps({
        "response": "The simulated carbon audit response from Gemma."
    }).encode("utf-8")
    
    payload = {
        "query": "What is our carbon footprint?",
        "model": "gemma3:4b",
        "style": "balanced",
        "context": {
            "metadata": {"filename": "test.csv", "caseCount": 10, "totalEvents": 50, "activityCount": 5},
            "totalCarbonKg": 2500,
            "violations": [{"severity": "critical"}],
            "supplierFitness": [{"avgCfsScore": 85.0}]
        }
    }
    
    with patch("urllib.request.urlopen", return_value=mock_response):
        response = client.post("/api/copilot/query", json=payload)
        print("QUERY RESPONSE TEXT (SUCCESS):", response.text)
        assert response.status_code == 200
        res_data = response.json()
        assert res_data["answer"] == "The simulated carbon audit response from Gemma."
        assert res_data["model"] == "gemma3:4b"
        assert "latencyMs" in res_data

def test_copilot_query_unreachable():
    payload = {
        "query": "What is our carbon footprint?",
        "model": "gemma3:4b",
        "style": "balanced"
    }
    
    with patch("urllib.request.urlopen", side_effect=urllib.error.URLError("Connection refused")):
        response = client.post("/api/copilot/query", json=payload)
        print("QUERY RESPONSE TEXT (UNREACHABLE):", response.text)
        assert response.status_code == 503
        assert "Ollama service is unreachable" in response.json()["detail"]
