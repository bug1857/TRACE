import io
import json
import pandas as pd
from column_mapper import map_columns

def run_tests():
    # 1. Test CSV with explicit "supplier_name" column
    csv_data_explicit = (
        "case_id,activity,timestamp,resource,supplier_name\n"
        "CASE-01,Order Received,2024-06-20T10:00:00Z,Rajesh,Supplier Alpha\n"
        "CASE-01,Warehouse Pick & Pack,2024-06-20T12:00:00Z,Priya,Supplier Beta\n"
        "CASE-01,Air Freight Dispatch,2024-06-20T14:30:00Z,Amit,Supplier Gamma\n"
        "CASE-02,Order Received,2024-06-20T10:15:00Z,Rajesh,Supplier Alpha\n"
        "CASE-02,Warehouse Pick & Pack,2024-06-20T13:00:00Z,Priya,Supplier Beta\n"
        "CASE-02,Road Transport Dispatch,2024-06-20T15:00:00Z,Amit,Supplier Gamma\n"
    )
    df_explicit = pd.read_csv(io.StringIO(csv_data_explicit))
    mapping_explicit = map_columns(df_explicit)

    print("\n--- TEST CASE 1: EXPLICIT SUPPLIER COLUMN ---")
    print(json.dumps(mapping_explicit, indent=2))

    assert mapping_explicit["supplier"]["column"] == "supplier_name", f"Expected supplier_name, got {mapping_explicit['supplier']['column']}"
    assert mapping_explicit["supplier"]["confidence"] >= 0.5, f"Expected higher confidence, got {mapping_explicit['supplier']['confidence']}"
    assert mapping_explicit["supplier"]["isResourceFallback"] is False, "Expected isResourceFallback to be False"

    # 2. Test CSV with NO supplier-like column but has "resource"
    csv_data_no_supplier = (
        "case_id,activity,timestamp,resource\n"
        "CASE-01,Order Received,2024-06-20T10:00:00Z,Rajesh\n"
        "CASE-01,Warehouse Pick & Pack,2024-06-20T12:00:00Z,Priya\n"
        "CASE-01,Air Freight Dispatch,2024-06-20T14:30:00Z,Amit\n"
        "CASE-02,Order Received,2024-06-20T10:15:00Z,Rajesh\n"
        "CASE-02,Warehouse Pick & Pack,2024-06-20T13:00:00Z,Priya\n"
        "CASE-02,Road Transport Dispatch,2024-06-20T15:00:00Z,Amit\n"
    )
    df_no_supplier = pd.read_csv(io.StringIO(csv_data_no_supplier))
    mapping_no_supplier = map_columns(df_no_supplier)

    print("\n--- TEST CASE 2: NO SUPPLIER COLUMN (RESOURCE FALLBACK) ---")
    print(json.dumps(mapping_no_supplier, indent=2))

    assert mapping_no_supplier["supplier"]["column"] is None, f"Expected None, got {mapping_no_supplier['supplier']['column']}"
    assert mapping_no_supplier["supplier"]["confidence"] == 0.0, f"Expected confidence 0.0, got {mapping_no_supplier['supplier']['confidence']}"
    assert mapping_no_supplier["supplier"]["isResourceFallback"] is True, "Expected isResourceFallback to be True"

    print("\nAll column mapper supplier detection tests passed successfully!")

if __name__ == "__main__":
    run_tests()
