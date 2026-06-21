import pandas as pd
import json
from carbon_fitness import calculate_cfs, calculate_supplier_fitness

def run_test():
    # Build synthetic dataframe matching test_conformance_standalone.py cases,
    # and assigning 2-3 distinct suppliers to the cases.
    data = [
        # CASE-01: Clean (Supplier A)
        {"case_id": "CASE-01", "activity": "Order Received", "timestamp": "2024-06-20T10:00:00Z", "weight": 50, "supplier_name": "Supplier A"},
        {"case_id": "CASE-01", "activity": "Warehouse Pick & Pack", "timestamp": "2024-06-20T11:00:00Z", "weight": 50, "supplier_name": "Supplier A"},
        {"case_id": "CASE-01", "activity": "Rail Freight Dispatch", "timestamp": "2024-06-20T12:00:00Z", "weight": 50, "supplier_name": "Supplier A"},
        
        # CASE-02: Air freight critical violation (Supplier A)
        {"case_id": "CASE-02", "activity": "Order Received", "timestamp": "2024-06-20T10:00:00Z", "weight": 100, "supplier_name": "Supplier A"},
        {"case_id": "CASE-02", "activity": "Air Freight Dispatch", "timestamp": "2024-06-20T13:00:00Z", "weight": 100, "supplier_name": "Supplier A"},
        
        # CASE-03: Air freight warning violation (Supplier B)
        {"case_id": "CASE-03", "activity": "Order Received", "timestamp": "2024-06-20T10:00:00Z", "weight": 15, "supplier_name": "Supplier B"},
        {"case_id": "CASE-03", "activity": "Air Freight Dispatch", "timestamp": "2024-06-20T13:00:00Z", "weight": 15, "supplier_name": "Supplier B"},
        
        # CASE-04: Truck delivery info violation (Supplier B)
        {"case_id": "CASE-04", "activity": "Order Received", "timestamp": "2024-06-20T10:00:00Z", "weight": 10, "supplier_name": "Supplier B"},
        {"case_id": "CASE-04", "activity": "Truck Delivery Transport Dispatch", "timestamp": "2024-06-20T14:00:00Z", "weight": 10, "supplier_name": "Supplier B"},
        
        # CASE-05: Double violations (Supplier C)
        {"case_id": "CASE-05", "activity": "Incineration Disposal", "timestamp": "2024-06-20T15:00:00Z", "weight": 5, "supplier_name": "Supplier C"},
        {"case_id": "CASE-05", "activity": "Landfill Disposal", "timestamp": "2024-06-20T16:00:00Z", "weight": 20, "supplier_name": "Supplier C"},
        
        # CASE-06: Clean (Supplier C)
        {"case_id": "CASE-06", "activity": "Order Received", "timestamp": "2024-06-20T10:00:00Z", "weight": 20, "supplier_name": "Supplier C"},
        {"case_id": "CASE-06", "activity": "Last Mile Delivery", "timestamp": "2024-06-20T17:00:00Z", "weight": 20, "supplier_name": "Supplier C"},
        
        # CASE-07: Zero carbon case (Supplier C)
        {"case_id": "CASE-07", "activity": "Order Received", "timestamp": "2024-06-20T10:00:00Z", "weight": 0, "supplier_name": "Supplier C"},
    ]
    
    df = pd.DataFrame(data)
    
    # 1. Run CFS calculations
    cfs_results = calculate_cfs(df, "case_id", "activity")
    print("\n--- STANDALONE CFS OUTPUT ---")
    print(json.dumps(cfs_results, indent=2))
    
    # Assertions for CFS
    cfs_dict = {r["caseId"]: r for r in cfs_results}
    assert len(cfs_results) == 7, f"Expected 7 cases, got {len(cfs_results)}"
    
    # Clean cases: CASE-01, CASE-06 should have 100.0 CFS
    assert cfs_dict["CASE-01"]["cfsScore"] == 100.0
    assert cfs_dict["CASE-01"]["violationCount"] == 0
    assert cfs_dict["CASE-06"]["cfsScore"] == 100.0
    assert cfs_dict["CASE-06"]["violationCount"] == 0
    
    # Zero-carbon case: CASE-07 should have 100.0 CFS, no crash, no NaN
    assert cfs_dict["CASE-07"]["cfsScore"] == 100.0
    assert cfs_dict["CASE-07"]["actualCarbonKg"] == 0.0
    assert cfs_dict["CASE-07"]["violationCount"] == 0
    
    # Violating cases should have CFS < 100.0
    assert cfs_dict["CASE-02"]["cfsScore"] < 100.0
    assert cfs_dict["CASE-02"]["violationCount"] == 1
    assert cfs_dict["CASE-03"]["cfsScore"] < 100.0
    assert cfs_dict["CASE-03"]["violationCount"] == 1
    assert cfs_dict["CASE-04"]["cfsScore"] < 100.0
    assert cfs_dict["CASE-04"]["violationCount"] == 1
    assert cfs_dict["CASE-05"]["cfsScore"] < 100.0
    assert cfs_dict["CASE-05"]["violationCount"] == 2
    
    # Verify math for CASE-02
    # actual: 50.0 + 262.0 = 312.0
    # ideal: 50.0 + 262.0 * (1 - 0.85) = 50.0 + 39.3 = 89.3
    # cfs: 100 * (89.3 / 312.0) = 28.62
    assert cfs_dict["CASE-02"]["actualCarbonKg"] == 312.0
    assert cfs_dict["CASE-02"]["idealCarbonKg"] == 89.3
    assert abs(cfs_dict["CASE-02"]["cfsScore"] - 28.62) < 1e-2
    
    # 2. Run Supplier Fitness calculations
    supplier_results = calculate_supplier_fitness(df, "case_id", "activity", "supplier_name", is_resource_fallback=False)
    print("\n--- STANDALONE SUPPLIER FITNESS OUTPUT ---")
    print(json.dumps(supplier_results, indent=2))
    
    # Assertions for Supplier Fitness
    assert len(supplier_results) == 3, f"Expected 3 suppliers, got {len(supplier_results)}"
    
    sup_dict = {s["supplier"]: s for s in supplier_results}
    
    # Verify totals
    # Supplier A: CASE-01 (56.0) + CASE-02 (312.0) = 368.0
    assert sup_dict["Supplier A"]["totalCarbonKg"] == 368.0
    assert sup_dict["Supplier A"]["caseCount"] == 2
    assert sup_dict["Supplier A"]["violationCount"] == 1
    # avg cfs: (100.0 + 28.62) / 2 = 64.31
    assert abs(sup_dict["Supplier A"]["avgCfsScore"] - 64.31) < 1e-2
    
    # Supplier B: CASE-03 (46.8) + CASE-04 (13.5) = 60.3
    assert sup_dict["Supplier B"]["totalCarbonKg"] == 60.3
    assert sup_dict["Supplier B"]["caseCount"] == 2
    assert sup_dict["Supplier B"]["violationCount"] == 2
    # avg cfs: (28.62 + 52.78) / 2 = 40.70
    assert abs(sup_dict["Supplier B"]["avgCfsScore"] - 40.70) < 1e-2
    
    # Supplier C: CASE-05 (12.5) + CASE-06 (17.6) + CASE-07 (0.0) = 30.1
    assert sup_dict["Supplier C"]["totalCarbonKg"] == 30.1
    assert sup_dict["Supplier C"]["caseCount"] == 3
    assert sup_dict["Supplier C"]["violationCount"] == 2
    # avg cfs: (38.0 + 100.0 + 100.0) / 3 = 79.33
    assert abs(sup_dict["Supplier C"]["avgCfsScore"] - 79.33) < 1e-2
    
    # Verify sort order is descending by avgCfsScore
    # Supplier C (79.33) -> Supplier A (64.31) -> Supplier B (40.70)
    assert supplier_results[0]["supplier"] == "Supplier C"
    assert supplier_results[1]["supplier"] == "Supplier A"
    assert supplier_results[2]["supplier"] == "Supplier B"
    
    print("\nAll standalone carbon fitness assertions passed successfully!")

if __name__ == "__main__":
    run_test()
