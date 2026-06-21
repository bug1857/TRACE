import pandas as pd

class ColumnMappingError(ValueError):
    """Exception raised when manual column mapping validation fails."""
    def __init__(self, error: str, missing_fields: list, detected_mapping: dict, available_columns: list):
        super().__init__(error)
        self.error = error
        self.missing_fields = missing_fields
        self.detected_mapping = detected_mapping
        self.available_columns = available_columns

    def to_dict(self):
        return {
            "error": self.error,
            "missing_fields": self.missing_fields,
            "detected_mapping": self.detected_mapping,
            "available_columns": self.available_columns
        }


# Standard aliases for process mining fields
CASE_ID_ALIASES = [
    "case_id", "caseid", "order_id", "orderid", "shipment_id", "shipmentid",
    "tracking_id", "trackingid", "consignment_id", "consignmentid", "case", "id",
    "job_id", "jobid", "ticket_id", "ticketid", "transaction_id", "transactionid"
]

ACTIVITY_ALIASES = [
    "activity", "event", "task", "action", "stage", "status", "concept:name",
    "conceptname", "operation", "step", "state"
]

TIMESTAMP_ALIASES = [
    "timestamp", "time", "date", "event_time", "eventtime", "occurred_at",
    "occurredat", "occurred", "datetime", "created_at", "createdat", "created",
    "creation_time", "creationtime", "timestamp_start", "timestampstart"
]

RESOURCE_ALIASES = [
    "resource", "actor", "performed_by", "performedby", "agent", "operator",
    "user", "handled_by", "handledby", "employee", "worker", "user_id", "userid"
]

SUPPLIER_ALIASES = [
    "supplier", "supplier_id", "supplier_name", "vendor", "vendor_id", "vendor_name"
]

def get_fuzzy_score(col_name: str, aliases: list) -> float:
    col_norm = col_name.lower().replace("_", "").replace("-", "").replace(" ", "")
    best_score = 0.0
    for alias in aliases:
        alias_norm = alias.lower().replace("_", "").replace("-", "").replace(" ", "")
        if col_norm == alias_norm:
            return 1.0
        elif alias_norm in col_norm or col_norm in alias_norm:
            best_score = max(best_score, 0.7)
    return best_score

def check_timestamp_shape(df: pd.DataFrame, col: str) -> float:
    try:
        parsed = pd.to_datetime(df[col], errors='coerce', format='mixed')
        valid_ratio = parsed.notna().sum() / len(df) if len(df) > 0 else 0
        return 1.0 if valid_ratio >= 0.8 else 0.0
    except Exception:
        return 0.0

def check_case_id_shape(df: pd.DataFrame, col: str) -> float:
    total_count = len(df)
    if total_count < 2:
        return 1.0
    try:
        num_unique = df[col].nunique()
        unique_ratio = num_unique / total_count
        
        # If every value is unique, it's not a case identifier (e.g. event ID or index)
        if unique_ratio > 0.90:
            return 0.1
        if num_unique == 1:
            return 0.2  # Too homogeneous, but theoretically possible
        return 1.0
    except Exception:
        return 0.0

def check_supplier_shape(df: pd.DataFrame, col: str) -> float:
    total_count = len(df)
    if total_count < 2:
        return 1.0
    try:
        num_unique = df[col].nunique()
        unique_ratio = num_unique / total_count
        if unique_ratio > 0.90:
            return 0.1
        if num_unique == 1:
            return 0.2
        return 1.0
    except Exception:
        return 0.0

def check_activity_shape(df: pd.DataFrame, col: str) -> float:
    total_count = len(df)
    if total_count < 2:
        return 1.0
    try:
        num_unique = df[col].nunique()
        unique_ratio = num_unique / total_count
        
        # An activity column should not have unique values for every row
        if unique_ratio > 0.95:
            return 0.1
        return 1.0
    except Exception:
        return 0.5

def map_columns(df: pd.DataFrame, mapping_override: dict | None = None) -> dict:
    if mapping_override is not None:
        missing_fields = []
        available_cols = list(df.columns)
        
        # Validate required fields: case_id, activity, timestamp
        for field in ["case_id", "activity", "timestamp"]:
            col_val = mapping_override.get(field)
            if not col_val or col_val not in available_cols:
                missing_fields.append(field)
                
        # Validate optional fields: resource, supplier (if key present and non-null)
        for field in ["resource", "supplier"]:
            if field in mapping_override:
                col_val = mapping_override[field]
                if col_val is not None and col_val not in available_cols:
                    missing_fields.append(field)
                    
        # Build mapping dict
        case_col = mapping_override.get("case_id")
        case_valid = case_col and case_col in available_cols
        case_map = {"column": case_col if case_valid else None, "confidence": 1.0 if case_valid else 0.0}
        
        act_col = mapping_override.get("activity")
        act_valid = act_col and act_col in available_cols
        act_map = {"column": act_col if act_valid else None, "confidence": 1.0 if act_valid else 0.0}
        
        ts_col = mapping_override.get("timestamp")
        ts_valid = ts_col and ts_col in available_cols
        ts_map = {"column": ts_col if ts_valid else None, "confidence": 1.0 if ts_valid else 0.0}
        
        res_col = mapping_override.get("resource")
        res_valid = res_col and res_col in available_cols
        res_map = {"column": res_col if res_valid else None, "confidence": 1.0 if res_valid else 0.0}
        
        sup_col = mapping_override.get("supplier")
        sup_valid = sup_col and sup_col in available_cols
        
        # isResourceFallback should be True in manual mode if supplier column is not explicitly mapped but resource is
        is_resource_fallback = False
        if not sup_valid and res_valid:
            is_resource_fallback = True
            
        sup_map = {
            "column": sup_col if sup_valid else None,
            "confidence": 1.0 if sup_valid else 0.0,
            "isResourceFallback": is_resource_fallback
        }
        
        mapping = {
            "case_id": case_map,
            "activity": act_map,
            "timestamp": ts_map,
            "resource": res_map,
            "supplier": sup_map,
            "mappingSource": "manual"
        }
        
        if missing_fields:
            # Reconstruct without mappingSource for detected_mapping in error
            detected_mapping = {
                "case_id": case_map,
                "activity": act_map,
                "timestamp": ts_map,
                "resource": res_map,
                "supplier": sup_map
            }
            raise ColumnMappingError(
                error=f"Failed to validate manual column mapping override. Missing or invalid fields: {', '.join(missing_fields)}",
                missing_fields=missing_fields,
                detected_mapping=detected_mapping,
                available_columns=available_cols
            )
            
        return mapping

    columns = list(df.columns)
    
    # 1. Map Timestamp
    ts_scores = {}
    for col in columns:
        f_score = get_fuzzy_score(col, TIMESTAMP_ALIASES)
        s_mult = check_timestamp_shape(df, col)
        ts_scores[col] = f_score * s_mult
    
    best_ts_col = max(ts_scores, key=ts_scores.get) if ts_scores else None
    ts_confidence = ts_scores[best_ts_col] if best_ts_col else 0.0
    
    # Fallback if no fuzzy match succeeded but a column parses as date
    if ts_confidence < 0.1:
        for col in columns:
            s_mult = check_timestamp_shape(df, col)
            if s_mult > ts_confidence:
                best_ts_col = col
                ts_confidence = 0.5
                
    remaining_cols = [c for c in columns if c != best_ts_col]

    # 2. Map Case ID
    case_scores = {}
    for col in remaining_cols:
        f_score = get_fuzzy_score(col, CASE_ID_ALIASES)
        s_mult = check_case_id_shape(df, col)
        case_scores[col] = f_score * s_mult
        
    best_case_col = max(case_scores, key=case_scores.get) if case_scores else None
    case_confidence = case_scores[best_case_col] if best_case_col else 0.0
    
    if case_confidence < 0.1 and remaining_cols:
        best_s_mult = 0.0
        best_case_col = None
        has_tie = False
        for col in remaining_cols:
            s_mult = check_case_id_shape(df, col)
            if s_mult > best_s_mult:
                best_s_mult = s_mult
                best_case_col = col
                has_tie = False
            elif s_mult == best_s_mult and s_mult > 0.0:
                has_tie = True
        
        if best_case_col:
            if has_tie and best_s_mult >= 0.5:
                case_confidence = 0.3
            else:
                case_confidence = 0.5

    remaining_cols = [c for c in remaining_cols if c != best_case_col]

    # 3. Map Activity
    act_scores = {}
    for col in remaining_cols:
        f_score = get_fuzzy_score(col, ACTIVITY_ALIASES)
        s_mult = check_activity_shape(df, col)
        act_scores[col] = f_score * s_mult
        
    best_act_col = max(act_scores, key=act_scores.get) if act_scores else None
    act_confidence = act_scores[best_act_col] if best_act_col else 0.0
    
    if act_confidence < 0.1 and remaining_cols:
        best_s_mult = 0.0
        best_act_col = None
        has_tie = False
        for col in remaining_cols:
            s_mult = check_activity_shape(df, col)
            if s_mult > best_s_mult:
                best_s_mult = s_mult
                best_act_col = col
                has_tie = False
            elif s_mult == best_s_mult and s_mult > 0.0:
                has_tie = True
                
        if best_act_col:
            if has_tie and best_s_mult >= 0.5:
                act_confidence = 0.3
            else:
                act_confidence = 0.5

    remaining_cols = [c for c in remaining_cols if c != best_act_col]

    # 4. Map Resource (Optional)
    res_scores = {}
    for col in remaining_cols:
        f_score = get_fuzzy_score(col, RESOURCE_ALIASES)
        s_mult = 1.0
        res_scores[col] = f_score * s_mult
        
    best_res_col = max(res_scores, key=res_scores.get) if res_scores else None
    res_confidence = res_scores[best_res_col] if best_res_col else 0.0
    
    if res_confidence < 0.3:
        best_res_col = None
        res_confidence = 0.0

    # 5. Map Supplier (Optional)
    remaining_cols_for_sup = [c for c in remaining_cols if c != best_res_col]
    sup_scores = {}
    for col in remaining_cols_for_sup:
        f_score = get_fuzzy_score(col, SUPPLIER_ALIASES)
        s_mult = check_supplier_shape(df, col)
        sup_scores[col] = f_score * s_mult
        
    best_sup_col = max(sup_scores, key=sup_scores.get) if sup_scores else None
    sup_confidence = sup_scores[best_sup_col] if best_sup_col else 0.0
    
    if sup_confidence < 0.3:
        best_sup_col = None
        sup_confidence = 0.0
        
    is_resource_fallback = False
    if best_sup_col is None and best_res_col is not None:
        is_resource_fallback = True

    return {
        "case_id": {"column": best_case_col, "confidence": round(case_confidence, 2)},
        "activity": {"column": best_act_col, "confidence": round(act_confidence, 2)},
        "timestamp": {"column": best_ts_col, "confidence": round(ts_confidence, 2)},
        "resource": {"column": best_res_col, "confidence": round(res_confidence, 2)},
        "supplier": {
            "column": best_sup_col,
            "confidence": round(sup_confidence, 2),
            "isResourceFallback": is_resource_fallback
        },
        "mappingSource": "auto"
    }

