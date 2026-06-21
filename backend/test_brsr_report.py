import json
from brsr_report import assemble_brsr_report

def test_brsr_report():
    print("--- STARTING BRSR REPORT TEST ---")

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
        {"activity": "Road Transport Dispatch", "category": "Scope 3", "totalCarbon": 800.0}
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
        {"supplier": "Supplier B", "violationCount": 0}
    ]

    process_optimization = {
        "bottlenecks": [
            {"activity": "Road Transport Dispatch", "avgWaitHours": 25.0, "status": "critical"},
            {"activity": "Warehouse Pick & Pack", "avgWaitHours": 5.0, "status": "optimized"}
        ]
    }

    # 2. Call assemble_brsr_report
    actual = assemble_brsr_report(
        metadata=metadata,
        carbon_budget=carbon_budget,
        total_carbon_kg=total_carbon_kg,
        activity_carbon_breakdown=activity_carbon_breakdown,
        violations=violations,
        cfs_scores=cfs_scores,
        supplier_fitness=supplier_fitness,
        process_optimization=process_optimization,
        org_name="Louis India Corp",
        workspace_context="Workspace Q3",
        project_context="Decarbonization Project",
        reporting_period="2026"
    )

    # 3. Print output
    print("\nACTUAL BRSR REPORT:")
    print(json.dumps(actual, indent=2))

    # 4. Hand-calculated expected values
    # Total cases = 5.
    # Violating cases = {"CASE-1", "CASE-2"} -> 2.
    # processComplianceScore = 100 * (1 - 2/5) = 60.0%
    expected_process_compliance = 60.0
    
    # carbonFitnessScore = (80 + 90 + 95 + 100 + 85) / 5 = 90.0%
    expected_carbon_fitness = 90.0
    
    # esgOverallScore = (60.0 + 90.0) / 2 = 75.0%
    expected_esg_overall = 75.0
    
    # worst bottleneck = Road Transport Dispatch (avgWaitHours = 25.0, critical)
    # worst hotspot = Road Transport Dispatch (800.0)
    # carbon budget status = "WITHIN_LIMIT" (limit = 2000.0, total = 1050.0)
    expected_exec_summary = (
        "This BRSR Compliance Report aggregates 5 case-level traces. "
        "The compliance check yields a fitness score of 60.0% with 2 active violations "
        "and 2 bottleneck activity nodes, where the worst delay is at 'Road Transport Dispatch'. "
        "Carbon attribution models tracked a total actual emission of 1050.0 kg CO2e (WITHIN_LIMIT), "
        "identifying 2 carbon hotspots with the largest hotspot at 'Road Transport Dispatch'. "
        "ESG overall scoring achieved 75.0%, monitoring 2 suppliers. "
        "Based on the collected evidence, this disclosure is classified as 'Needs Review'."
    )

    print("\nRunning validations...")

    # Validate header
    assert actual["header"]["orgName"] == "Louis India Corp"
    assert actual["header"]["auditReadiness"] == "Needs Review"
    assert "reportHash" in actual["header"]

    # Validate sectionA
    assert "sectionA" in actual
    assert actual["sectionA"]["orgName"] == "Louis India Corp"
    assert actual["sectionA"]["auditReadiness"] == "Needs Review"
    assert actual["sectionA"]["reportingPeriod"] == "2026"
    assert "reportHash" not in actual["sectionA"]
    print("✓ Section A matched.")

    # Validate summary
    assert actual["executiveSummary"] == expected_exec_summary, f"\nExpected: {expected_exec_summary}\nGot: {actual['executiveSummary']}"
    print("✓ Executive summary matched.")

    # Validate KPI Strip
    assert actual["kpiStrip"]["processComplianceScore"] == expected_process_compliance, f"Got: {actual['kpiStrip']['processComplianceScore']}"
    assert actual["kpiStrip"]["carbonFitnessScore"] == expected_carbon_fitness, f"Got: {actual['kpiStrip']['carbonFitnessScore']}"
    assert actual["kpiStrip"]["esgOverallScore"] == expected_esg_overall, f"Got: {actual['kpiStrip']['esgOverallScore']}"
    assert actual["kpiStrip"]["totalActualEmissions"] == total_carbon_kg
    print("✓ KPI Strip scores matched.")

    # Validate Section B & C
    assert actual["sectionB"]["totalEvaluatedTraces"] == 5
    assert actual["sectionB"]["nonConformingTraces"] == 2
    assert actual["sectionC"]["resourceDraw"]["carbonBudgetLimitKg"] == 2000.0
    assert actual["sectionC"]["resourceDraw"]["carbonBudgetStatus"] == "WITHIN_LIMIT"
    
    # Assert carbonHotspots sorted descending
    hotspots = actual["sectionC"]["carbonHotspots"]
    assert hotspots[0]["contributionPercent"] >= hotspots[-1]["contributionPercent"]
    assert hotspots[0]["contributionPercent"] == 76.2  # 800 / 1050 * 100
    assert hotspots[1]["contributionPercent"] == 23.8  # 250 / 1050 * 100
    print("✓ Conformance, resource draw, and hotspot percentages matched (and correctly sorted descending).")

    # Validate Recommendations
    recs = actual["recommendations"]
    assert len(recs) == 3, f"Expected 3 recommendations, got {len(recs)}"
    
    # 1. Compliance
    assert recs[0]["title"] == "Standardize compliance validation workflows"
    assert recs[0]["priority"] == "HIGH"
    
    # 2. Bottleneck (Road Transport Dispatch is critical, carbonDeltaKg sum of violations = 150 + 100 = 250.0)
    assert recs[1]["title"] == "Optimize bottleneck at 'Road Transport Dispatch'"
    assert recs[1]["priority"] == "HIGH"
    assert recs[1]["estEmissionReductionKg"] == 250.0, f"Expected 250.0, got {recs[1]['estEmissionReductionKg']}"
    
    # 3. Supplier compliance risk
    assert recs[2]["title"] == "Remediate supplier compliance risk"
    print("✓ Recommendations dynamically derived and emission reductions matched.")

    print("\n=============================================")
    print("ALL BRSR TEST CASES PASSED SUCCESSFULLY!")
    print("=============================================")

if __name__ == "__main__":
    test_brsr_report()
