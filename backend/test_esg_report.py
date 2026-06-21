import json
from esg_report import assemble_esg_report

def test_esg_report():
    print("--- STARTING ESG REPORT TEST ---")

    # 1. Setup synthetic input data
    metadata = {
        "caseCount": 5,
        "rowCount": 20,
        "activityCount": 4,
        "totalEvents": 20
    }

    carbon_budget = [
        {"month": "Jan 2026", "budget": 1000.0, "actual": 450.0},
        {"month": "Feb 2026", "budget": 1000.0, "actual": 600.0}
    ]

    total_carbon_kg = 1050.0

    activity_carbon_breakdown = [
        {"activity": "Warehouse Pick & Pack", "category": "Scope 3", "totalCarbon": 250.0},
        {"activity": "Road Transport Dispatch", "category": "Scope 3", "totalCarbon": 700.0},
        {"activity": "Customs Clearance", "category": "Scope 3", "totalCarbon": 50.0},
        {"activity": "Last Mile Delivery", "category": "Scope 3", "totalCarbon": 50.0}
    ]

    violations = [
        {"caseId": "CASE-1", "activity": "Road Transport Dispatch", "carbonDeltaKg": 150.0},
        {"caseId": "CASE-2", "activity": "Road Transport Dispatch", "carbonDeltaKg": 100.0}
    ]

    cfs_scores = [
        {"caseId": "CASE-1", "cfsScore": 80.0},
        {"caseId": "CASE-2", "cfsScore": 90.0},
        {"caseId": "CASE-3", "cfsScore": 95.0},
        {"caseId": "CASE-4", "cfsScore": 100.0},
        {"caseId": "CASE-5", "cfsScore": 85.0}
    ]

    supplier_fitness = [
        {"supplier": "Supplier A", "violationCount": 1},
        {"supplier": "Supplier B", "violationCount": 0},
        {"supplier": "Supplier C", "violationCount": 0}
    ]

    # 2. Call assemble_esg_report
    actual = assemble_esg_report(
        metadata=metadata,
        carbon_budget=carbon_budget,
        total_carbon_kg=total_carbon_kg,
        activity_carbon_breakdown=activity_carbon_breakdown,
        violations=violations,
        cfs_scores=cfs_scores,
        supplier_fitness=supplier_fitness
    )

    print("\nACTUAL ESG REPORT:")
    print(json.dumps(actual, indent=2))

    # 3. Validations
    print("\nRunning validations...")

    # Environmental validations
    assert actual["environmental"]["score"] == 90.0
    assert actual["environmental"]["totalCarbonKg"] == 1050.0
    assert actual["environmental"]["carbonBudgetStatus"] == "WITHIN_LIMIT"
    assert len(actual["environmental"]["topHotspots"]) == 3
    assert actual["environmental"]["topHotspots"][0]["activity"] == "Road Transport Dispatch"
    assert actual["environmental"]["topHotspots"][1]["activity"] == "Warehouse Pick & Pack"
    assert actual["environmental"]["topHotspots"][2]["activity"] in ["Customs Clearance", "Last Mile Delivery"]
    print("✓ Environmental section verified.")

    # Social validations
    assert actual["social"]["score"] is None
    assert actual["social"]["supplierCount"] == 3
    assert actual["social"]["atRiskSupplierCount"] == 1
    print("✓ Social section verified.")

    # Governance validations
    assert actual["governance"]["score"] == 60.0
    assert actual["governance"]["violationCount"] == 2
    assert actual["governance"]["auditReadiness"] == "Needs Review"
    print("✓ Governance section verified.")

    # Overall validation
    assert actual["overallScore"] == 75.0
    print("✓ Overall score verified.")

    print("\n=============================================")
    print("ALL ESG REPORT TEST CASES PASSED SUCCESSFULLY!")
    print("=============================================")

if __name__ == "__main__":
    test_esg_report()
