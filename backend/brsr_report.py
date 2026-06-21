import json
import hashlib

def assemble_brsr_report(
    metadata: dict,
    carbon_budget: list,
    total_carbon_kg: float,
    activity_carbon_breakdown: list,
    violations: list,
    cfs_scores: list,
    supplier_fitness: list,
    process_optimization: dict,
    org_name: str = "Demo Organization",
    workspace_context: str = "default",
    project_context: str = "default",
    reporting_period: str = "2026",
    water_liters: float = None,
    energy_kwh: float = None
) -> dict:
    """
    Assembles a BRSR disclosure payload from data already computed elsewhere.
    """
    # Try to derive reporting period from metadata timestamp info if present
    min_ts = metadata.get("minTimestamp") or metadata.get("min_timestamp") or metadata.get("startTimestamp") or metadata.get("start_timestamp")
    max_ts = metadata.get("maxTimestamp") or metadata.get("max_timestamp") or metadata.get("endTimestamp") or metadata.get("end_timestamp")
    
    if min_ts and max_ts:
        try:
            import pandas as pd
            min_dt = pd.to_datetime(min_ts)
            max_dt = pd.to_datetime(max_ts)
            reporting_period = f"{min_dt.strftime('%b %Y')} – {max_dt.strftime('%b %Y')}"
        except Exception:
            pass
    elif metadata.get("timestampRange") or metadata.get("timestamp_range"):
        reporting_period = metadata.get("timestampRange") or metadata.get("timestamp_range")
    else:
        # Fallback: metadata passed from the API currently contains only row/case/activity counts
        # and filename. Since no timestamp range is present in metadata, we default to the passed
        # reporting_period parameter (e.g., '2026') or the default value.
        pass

    total_cases = metadata.get("caseCount", 1)
    if total_cases == 0:
        total_cases = 1

    # 1. Process Compliance Score
    violating_cases = set(v.get("caseId") for v in violations if v.get("caseId"))
    distinct_violating_cases = len(violating_cases)
    process_compliance_score = round(100.0 * (1.0 - distinct_violating_cases / total_cases), 1)
    process_compliance_score = max(0.0, min(100.0, process_compliance_score))

    # 2. Carbon Fitness Score
    if cfs_scores:
        cfs_values = [c.get("cfsScore") for c in cfs_scores if c.get("cfsScore") is not None]
        if not cfs_values:
            # Fallback to key "cfs" if cfsScore is not present
            cfs_values = [c.get("cfs") for c in cfs_scores if c.get("cfs") is not None]
        carbon_fitness_score = round(sum(cfs_values) / len(cfs_values), 1) if cfs_values else 100.0
    else:
        carbon_fitness_score = 100.0

    # 3. ESG Overall Score
    # Note: Simple mean of the carbon fitness and process compliance scores.
    # This is a derived placeholder score and should not be used as an authoritative ESG rating.
    esg_overall_score = round((carbon_fitness_score + process_compliance_score) / 2.0, 1)

    # 4. Report Hash
    metadata_str = json.dumps(metadata, sort_keys=True)
    hasher = hashlib.sha256()
    hasher.update((metadata_str + str(total_carbon_kg)).encode("utf-8"))
    report_hash = hasher.hexdigest()

    # 5. Audit Readiness
    audit_readiness = "Audit Ready" if process_compliance_score >= 70.0 else "Needs Review"

    # 6. Carbon Budget Limit & Status
    carbon_budget_limit_kg = sum(c.get("budget", 0.0) for c in carbon_budget)
    carbon_budget_status = "EXCEEDED" if total_carbon_kg > carbon_budget_limit_kg else "WITHIN_LIMIT"

    # 7. Carbon Hotspots Contribution Percent
    carbon_hotspots = []
    for item in activity_carbon_breakdown:
        total_carbon = item.get("totalCarbon", 0.0)
        contrib = round((total_carbon / total_carbon_kg * 100.0), 1) if total_carbon_kg > 0.0 else 0.0
        new_item = item.copy()
        new_item["contributionPercent"] = contrib
        carbon_hotspots.append(new_item)
    carbon_hotspots.sort(key=lambda x: x["contributionPercent"], reverse=True)

    # 8. Worst Bottleneck
    bottlenecks_list = process_optimization.get("bottlenecks", [])
    num_bottlenecks = len(bottlenecks_list)
    if bottlenecks_list:
        worst_b = max(bottlenecks_list, key=lambda x: x.get("avgWaitHours", x.get("avgWaitTime", 0.0)))
        worst_activity = worst_b.get("activity", "N/A")
        worst_delay = worst_b.get("avgWaitHours", worst_b.get("avgWaitTime", 0.0))
    else:
        worst_activity = "N/A"
        worst_delay = 0.0

    # 9. Worst Carbon Hotspot
    if activity_carbon_breakdown:
        worst_h = max(activity_carbon_breakdown, key=lambda x: x.get("totalCarbon", 0.0))
        worst_h_activity = worst_h.get("activity", "N/A")
    else:
        worst_h_activity = "N/A"

    # 10. Executive Summary Narrative
    num_suppliers = len(supplier_fitness)
    exec_summary = (
        f"This BRSR Compliance Report aggregates {metadata.get('caseCount', 0)} case-level traces. "
        f"The compliance check yields a fitness score of {process_compliance_score}% with {len(violations)} active violations "
        f"and {num_bottlenecks} bottleneck activity nodes, where the worst delay is at '{worst_activity}'. "
        f"Carbon attribution models tracked a total actual emission of {total_carbon_kg} kg CO2e ({carbon_budget_status}), "
        f"identifying {len(activity_carbon_breakdown)} carbon hotspots with the largest hotspot at '{worst_h_activity}'. "
        f"ESG overall scoring achieved {esg_overall_score}%, monitoring {num_suppliers} suppliers. "
        f"Based on the collected evidence, this disclosure is classified as '{audit_readiness}'."
    )

    # 11. Recommendations
    recommendations = []
    if process_compliance_score < 90.0:
        priority = "MEDIUM" if process_compliance_score >= 70.0 else "HIGH"
        recommendations.append({
            "title": "Standardize compliance validation workflows",
            "priority": priority,
            "narrative": f"Process compliance score is currently at {process_compliance_score}% with {len(violations)} active violations. Action is required to standardize compliance checks."
        })

    if carbon_budget_status == "EXCEEDED":
        recommendations.append({
            "title": "Remediate carbon budget exceedance",
            "priority": "CRITICAL",
            "narrative": f"Actual carbon emissions of {total_carbon_kg} kg CO2e exceeded the budget limit of {carbon_budget_limit_kg} kg CO2e."
        })

    critical_bottlenecks = [b for b in bottlenecks_list if b.get("status") == "critical"]
    for cb in critical_bottlenecks:
        act = cb.get("activity")
        avg_wait = cb.get("avgWaitHours", cb.get("avgWaitTime", 0.0))
        # Sum carbonDeltaKg of violations for this activity
        act_violations = [v for v in violations if v.get("activity") == act]
        est_red = sum(v.get("carbonDeltaKg", 0.0) for v in act_violations)
        rec = {
            "title": f"Optimize bottleneck at '{act}'",
            "priority": "HIGH",
            "narrative": f"Activity '{act}' is a critical bottleneck with an average wait time of {avg_wait} hours."
        }
        if est_red > 0.0:
            rec["estEmissionReductionKg"] = round(est_red, 2)
        recommendations.append(rec)

    at_risk_suppliers = [s for s in supplier_fitness if s.get("violationCount", 0) > 0]
    if at_risk_suppliers:
        recommendations.append({
            "title": "Remediate supplier compliance risk",
            "priority": "HIGH",
            "narrative": f"Detected {len(at_risk_suppliers)} at-risk suppliers with active process conformance violations."
        })

    # 12. Traceability Matrix (hardcoded mapping)
    traceability_matrix = [
        {"metric": "Carbon Fitness Score", "engine": "Carbon Fitness Engine", "sourceTable": "carbon_fitness.py", "referenceField": "cfsScore"},
        {"metric": "Total Emissions", "engine": "Carbon Budget Engine", "sourceTable": "carbon_budget.py", "referenceField": "totalCarbonKg"},
        {"metric": "Process Compliance Score", "engine": "Conformance Engine", "sourceTable": "conformance.py", "referenceField": "violations"},
        {"metric": "Supplier Risk Rankings", "engine": "Carbon Fitness Engine", "sourceTable": "carbon_fitness.py", "referenceField": "supplierFitness"},
        {"metric": "Bottleneck Wait Times", "engine": "Process Optimization Engine", "sourceTable": "process_optimization.py", "referenceField": "bottlenecks"}
    ]

    return {
        "header": {
            "orgName": org_name,
            "workspaceContext": workspace_context,
            "projectContext": project_context,
            "reportingPeriod": reporting_period,
            "reportVersion": "Version 1",
            "auditReadiness": audit_readiness,
            "reportHash": report_hash
        },
        "executiveSummary": exec_summary,
        "kpiStrip": {
            "processComplianceScore": process_compliance_score,
            "carbonFitnessScore": carbon_fitness_score,
            "esgOverallScore": esg_overall_score,
            "totalActualEmissions": total_carbon_kg
        },
        "sectionA": {
            "orgName": org_name,
            "workspaceContext": workspace_context,
            "projectContext": project_context,
            "reportingPeriod": reporting_period,
            "reportVersion": "Version 1",
            "auditReadiness": audit_readiness
        },
        "sectionB": {
            "conformanceMethodology": "rule_based_pattern_matching",
            "totalEvaluatedTraces": metadata.get("caseCount", 0),
            "nonConformingTraces": distinct_violating_cases,
            "bottlenecks": bottlenecks_list
        },
        "sectionC": {
            "resourceDraw": {
                "energyKwh": energy_kwh,
                "waterLiters": water_liters,
                "wasteKg": None,
                "carbonBudgetLimitKg": carbon_budget_limit_kg,
                "carbonBudgetStatus": carbon_budget_status
            },
            "carbonHotspots": carbon_hotspots
        },
        "sectionD_traceabilityMatrix": traceability_matrix,
        "recommendations": recommendations
    }
