import json
import os
import pandas as pd
from column_mapper import map_columns, ColumnMappingError

def run_override_tests():
    # Load the real test CSV
    csv_path = os.path.join(os.path.dirname(__file__), "test_common.csv")
    print(f"Loading CSV from: {csv_path}")
    df = pd.read_csv(csv_path)
    
    print("\n==================================================")
    print("TEST 1: Call mapping function with NO override")
    print("==================================================")
    mapping_auto = map_columns(df)
    assert mapping_auto["mappingSource"] == "auto", "Expected mappingSource to be 'auto'"
    print(json.dumps(mapping_auto, indent=2))
    
    print("\n==================================================")
    print("TEST 2: Call mapping function WITH a valid override")
    print("==================================================")
    valid_override = {
        "case_id": "case_id",
        "activity": "activity",
        "timestamp": "timestamp",
        "resource": "resource",
        "supplier": None
    }
    mapping_manual = map_columns(df, mapping_override=valid_override)
    assert mapping_manual["mappingSource"] == "manual", "Expected mappingSource to be 'manual'"
    assert mapping_manual["case_id"]["confidence"] == 1.0, "Expected case_id confidence to be 1.0"
    assert mapping_manual["activity"]["confidence"] == 1.0, "Expected activity confidence to be 1.0"
    assert mapping_manual["timestamp"]["confidence"] == 1.0, "Expected timestamp confidence to be 1.0"
    assert mapping_manual["resource"]["confidence"] == 1.0, "Expected resource confidence to be 1.0"
    assert mapping_manual["supplier"]["confidence"] == 0.0, "Expected supplier confidence to be 0.0"
    assert mapping_manual["supplier"]["column"] is None, "Expected supplier column to be None"
    assert mapping_manual["supplier"]["isResourceFallback"] is True, "Expected isResourceFallback to be True"
    print(json.dumps(mapping_manual, indent=2))
    
    print("\n==================================================")
    print("TEST 3: Call mapping function WITH an invalid override")
    print("==================================================")
    invalid_override = {
        "case_id": "invalid_case_column",
        "activity": "activity",
        "timestamp": "timestamp"
    }
    try:
        map_columns(df, mapping_override=invalid_override)
        raise AssertionError("Expected ColumnMappingError was not raised!")
    except ColumnMappingError as e:
        error_dict = e.to_dict()
        assert "case_id" in error_dict["missing_fields"], "Expected 'case_id' in missing_fields"
        print(json.dumps(error_dict, indent=2))
        
    print("\nAll override tests completed and passed assertions successfully!")

if __name__ == "__main__":
    run_override_tests()
