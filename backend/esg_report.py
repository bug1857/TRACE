import json

def assemble_esg_report(
    metadata: dict,
    carbon_budget: list,
    total_carbon_kg: float,
    activity_carbon_breakdown: list,
    violations: list,
    cfs_scores: list,
    supplier_fitness: list
) -> dict:
    """
    Assembles an ESG report disclosure payload from computed process and carbon metrics.
    """
    # 1. Environmental Pillar
    if cfs_scores:
        cfs_values = [c.get("cfsScore") for c in cfs_scores if c.get("cfsScore") is not None]
        if not cfs_values:
            cfs_values = [c.get("cfs") for c in cfs_scores if c.get("cfs") is not None]
        environmental_score = round(sum(cfs_values) / len(cfs_values), 1) if cfs_values else 100.0
    else:
        environmental_score = 100.0

    carbon_budget_limit_kg = sum(c.get("budget", 0.0) for c in carbon_budget)
    carbon_budget_status = "EXCEEDED" if total_carbon_kg > carbon_budget_limit_kg else "WITHIN_LIMIT"

    sorted_hotspots = sorted(activity_carbon_breakdown, key=lambda x: x.get("totalCarbon", 0.0), reverse=True)
    top_hotspots = [item.copy() for item in sorted_hotspots[:3]]

    # 2. Social Pillar
    supplier_count = len(supplier_fitness)
    at_risk_supplier_count = sum(1 for s in supplier_fitness if s.get("violationCount", 0) > 0)

    # 3. Governance Pillar
    total_cases = metadata.get("caseCount", 1)
    if total_cases == 0:
        total_cases = 1
    violating_cases = set(v.get("caseId") for v in violations if v.get("caseId"))
    distinct_violating_cases = len(violating_cases)
    governance_score = round(100.0 * (1.0 - distinct_violating_cases / total_cases), 1)
    governance_score = max(0.0, min(100.0, governance_score))

    audit_readiness = "Audit Ready" if governance_score >= 70.0 else "Needs Review"

    # 4. Overall Score
    # The overall ESG score is calculated as the mean of the environmental.score and governance.score only.
    # The social.score is null due to lack of direct metrics, so it is excluded from the average calculation.
    overall_score = round((environmental_score + governance_score) / 2.0, 1)

    return {
        "environmental": {
            "score": environmental_score,
            "totalCarbonKg": total_carbon_kg,
            "carbonBudgetStatus": carbon_budget_status,
            "topHotspots": top_hotspots,
            "dataCompleteness": "full"
        },
        "social": {
            "score": None,
            "supplierCount": supplier_count,
            "atRiskSupplierCount": at_risk_supplier_count,
            "note": "Social pillar evaluated via supplier compliance proxy only — no direct labor/community data available in source dataset.",
            "dataCompleteness": "partial"
        },
        "governance": {
            "score": governance_score,
            "violationCount": len(violations),
            "auditReadiness": audit_readiness,
            "note": "Governance pillar evaluated via process conformance proxy only — no board/policy data available in source dataset.",
            "dataCompleteness": "partial"
        },
        "overallScore": overall_score
    }
