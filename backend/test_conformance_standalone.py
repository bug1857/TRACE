import pandas as pd
import json
from conformance import detect_violations

def run_test():
    # Build synthetic dataframe
    # Case-01: Clean (no violations)
    # Case-02: Air freight critical violation (weight = 100)
    # Case-03: Air freight warning violation (weight = 15)
    # Case-04: Truck delivery info violation (weight = 10)
    # Case-05: Double violations: Landfill info violation (weight = 20) + Incineration info violation (weight = 5)
    # Case-06: Clean (no violations)
    data = [
        # Case-01: Clean
        {"case_id": "CASE-01", "activity": "Order Received", "timestamp": "2024-06-20T10:00:00Z", "weight": 50},
        {"case_id": "CASE-01", "activity": "Warehouse Pick & Pack", "timestamp": "2024-06-20T11:00:00Z", "weight": 50},
        {"case_id": "CASE-01", "activity": "Rail Freight Dispatch", "timestamp": "2024-06-20T12:00:00Z", "weight": 50},
        
        # Case-02: Air freight critical violation
        {"case_id": "CASE-02", "activity": "Order Received", "timestamp": "2024-06-20T10:00:00Z", "weight": 100},
        {"case_id": "CASE-02", "activity": "Air Freight Dispatch", "timestamp": "2024-06-20T13:00:00Z", "weight": 100},
        
        # Case-03: Air freight warning violation
        {"case_id": "CASE-03", "activity": "Order Received", "timestamp": "2024-06-20T10:00:00Z", "weight": 15},
        {"case_id": "CASE-03", "activity": "Air Freight Dispatch", "timestamp": "2024-06-20T13:00:00Z", "weight": 15},
        
        # Case-04: Truck delivery info violation
        {"case_id": "CASE-04", "activity": "Order Received", "timestamp": "2024-06-20T10:00:00Z", "weight": 10},
        {"case_id": "CASE-04", "activity": "Truck Delivery Transport Dispatch", "timestamp": "2024-06-20T14:00:00Z", "weight": 10},
        
        # Case-05: Double violations
        {"case_id": "CASE-05", "activity": "Incineration Disposal", "timestamp": "2024-06-20T15:00:00Z", "weight": 5},
        {"case_id": "CASE-05", "activity": "Landfill Disposal", "timestamp": "2024-06-20T16:00:00Z", "weight": 20},
        
        # Case-06: Clean
        {"case_id": "CASE-06", "activity": "Order Received", "timestamp": "2024-06-20T10:00:00Z", "weight": 20},
        {"case_id": "CASE-06", "activity": "Last Mile Delivery", "timestamp": "2024-06-20T17:00:00Z", "weight": 20},
    ]
    
    df = pd.DataFrame(data)
    
    # Run detector
    violations = detect_violations(df, "case_id", "activity", "timestamp")
    
    # Print output as formatted JSON
    print("\n--- STANDALONE CONFORMANCE TEST OUTPUT ---")
    print(json.dumps(violations, indent=2))
    
    # Count severities
    severities = [v["severity"] for v in violations]
    critical_count = severities.count("critical")
    warning_count = severities.count("warning")
    info_count = severities.count("info")
    
    # Assertions
    assert len(violations) == 5, f"Expected 5 violations, got {len(violations)}"
    assert critical_count == 4, f"Expected 4 critical violations, got {critical_count}"
    assert warning_count == 1, f"Expected 1 warning violations, got {warning_count}"
    assert info_count == 0, f"Expected 0 info violations, got {info_count}"
    
    violated_cases = {v["caseId"] for v in violations}
    assert "CASE-01" not in violated_cases, "CASE-01 should have no violations"
    assert "CASE-06" not in violated_cases, "CASE-06 should have no violations"
    
    # Assert ID uniqueness and non-zero deltas
    violation_ids = [v["id"] for v in violations]
    assert len(violation_ids) == len(set(violation_ids)), f"Duplicate violation IDs found: {violation_ids}"
    
    for v in violations:
        assert v["carbonDeltaKg"] > 0.0, f"Violation {v['id']} has a zero or negative delta: {v['carbonDeltaKg']}"
        assert v["estimated"] is True, f"Violation {v['id']} estimated flag should be True"
        
    # Verify exact values by case ID and activity
    expected_violations = {
        ("CASE-02", "Air Freight Dispatch"): {
            "id": "v-CASE-02-AirFreightDispatch-4",
            "mandatedAlternative": "rail freight",
            "category": "transport",
            "severity": "critical",
            "carbonDeltaKg": 222.70
        },
        ("CASE-03", "Air Freight Dispatch"): {
            "id": "v-CASE-03-AirFreightDispatch-6",
            "mandatedAlternative": "rail freight",
            "category": "transport",
            "severity": "critical",
            "carbonDeltaKg": 33.41
        },
        ("CASE-04", "Truck Delivery Transport Dispatch"): {
            "id": "v-CASE-04-TruckDeliveryTransportDispatch-8",
            "mandatedAlternative": "rail delivery",
            "category": "transport",
            "severity": "critical",
            "carbonDeltaKg": 6.38
        },
        ("CASE-05", "Incineration Disposal"): {
            "id": "v-CASE-05-IncinerationDisposal-9",
            "mandatedAlternative": "recycling",
            "category": "waste",
            "severity": "warning",
            "carbonDeltaKg": 1.75
        },
        ("CASE-05", "Landfill Disposal"): {
            "id": "v-CASE-05-LandfillDisposal-10",
            "mandatedAlternative": "recycling",
            "category": "waste",
            "severity": "critical",
            "carbonDeltaKg": 6.00
        }
    }
    
    for v in violations:
        key = (v["caseId"], v["activity"])
        assert key in expected_violations, f"Unexpected violation key: {key}"
        expected = expected_violations[key]
        assert v["id"] == expected["id"], f"Expected ID {expected['id']}, got {v['id']}"
        assert v["mandatedAlternative"] == expected["mandatedAlternative"], f"Expected alternative {expected['mandatedAlternative']}, got {v['mandatedAlternative']}"
        assert v["category"] == expected["category"], f"Expected category {expected['category']}, got {v['category']}"
        assert v["severity"] == expected["severity"], f"Expected severity {expected['severity']}, got {v['severity']}"
        assert abs(v["carbonDeltaKg"] - expected["carbonDeltaKg"]) < 1e-6, f"Expected delta {expected['carbonDeltaKg']}, got {v['carbonDeltaKg']}"

    print("\nAll standalone conformance assertions (including exact deltas, unique IDs, and non-zero values) passed successfully!")

if __name__ == "__main__":
    run_test()

