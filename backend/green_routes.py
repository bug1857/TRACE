from typing import List, Dict, Any

# Static mapping table for alternative green routes.
# These match the same activities conformance.py flags.
#
# Assumption: Cost deltas and confidence values are static engineering estimates since
# they cannot be derived directly from the event log CSV dataset.
ROUTE_ALTERNATIVES = {
    "Air Freight Dispatch": {
        "alternative": "Express Electric Rail",
        "reduction_factor": 0.85,  # rail vs air freight assumed ~85% carbon reduction (industry-typical)
        "cost_delta": -450,        # static estimate: saving of $450
        "confidence": 0.95
    },
    "Truck Delivery Transport Dispatch": {
        "alternative": "Express Electric Rail Delivery",
        "reduction_factor": 0.75,  # electric rail vs truck transport assumed ~75% carbon reduction
        "cost_delta": -150,        # static estimate: saving of $150
        "confidence": 0.90
    },
    "Incineration Disposal": {
        "alternative": "Recycling Processing Facility",
        "reduction_factor": 0.70,  # recycling vs incineration assumed ~70% carbon reduction
        "cost_delta": 120,         # static estimate: cost increase of $120
        "confidence": 0.85
    },
    "Landfill Disposal": {
        "alternative": "Composting & Recycling Facility",
        "reduction_factor": 0.60,  # composting/recycling vs landfill assumed ~60% carbon reduction
        "cost_delta": -80,         # static estimate: saving of $80 on landfill taxes
        "confidence": 0.80
    }
}

def compute_green_routes(activity_carbon_breakdown: List[Dict[str, Any]], violations: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Compute alternative green route recommendations based on the real activity carbon breakdown.
    
    Args:
        activity_carbon_breakdown: List of activity breakdown dicts (e.g. from carbon_budget.py)
        violations: Optional list of violations (for potential custom logic/filtering, currently unused)
        
    Returns:
        A list of recommendation dicts matching RouteRecommendation structure.
    """
    recommendations = []
    idx = 1
    
    for item in activity_carbon_breakdown:
        activity_name = item.get("activity")
        if activity_name in ROUTE_ALTERNATIVES:
            alt_info = ROUTE_ALTERNATIVES[activity_name]
            freq = item.get("frequency", 0)
            total_carbon = item.get("totalCarbon", 0.0)
            
            # Calculate carbon saving based on industry-typical reduction percentages
            saving = total_carbon * alt_info["reduction_factor"]
            
            # Use static cost delta and confidence from the mapping table
            cost_delta = alt_info["cost_delta"]
            confidence = alt_info["confidence"]
            
            current_route = f"{activity_name} ({freq} shipments, {total_carbon:.1f}kg total)"
            recommended_route = alt_info["alternative"]
            
            recommendations.append({
                "id": f"rec-{idx}",
                "currentRoute": current_route,
                "recommendedRoute": recommended_route,
                "carbonSaving": round(saving, 2),
                "costDelta": int(cost_delta),
                "confidence": confidence
            })
            idx += 1
            
    return recommendations
