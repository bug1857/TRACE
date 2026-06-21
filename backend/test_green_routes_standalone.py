from green_routes import compute_green_routes

def test_standalone():
    # Synthetic carbon breakdown data
    synthetic_breakdown = [
        {
            "activity": "Air Freight Dispatch",
            "category": "air_freight",
            "estimated": False,
            "frequency": 10,
            "totalCarbon": 1000.0
        },
        {
            "activity": "Truck Delivery Transport Dispatch",
            "category": "road_transport",
            "estimated": False,
            "frequency": 20,
            "totalCarbon": 500.0
        },
        {
            "activity": "Incineration Disposal",
            "category": "waste",
            "estimated": False,
            "frequency": 5,
            "totalCarbon": 100.0
        },
        {
            "activity": "Landfill Disposal",
            "category": "waste",
            "estimated": False,
            "frequency": 8,
            "totalCarbon": 200.0
        },
        {
            "activity": "Warehouse Pick & Pack",
            "category": "warehouse",
            "estimated": False,
            "frequency": 50,
            "totalCarbon": 6.0
        }
    ]

    results = compute_green_routes(synthetic_breakdown)
    
    # Assert we get recommendations for the mapped items (4 out of 5)
    assert len(results) == 4, f"Expected 4 recommendations, got {len(results)}"

    # 1. Verify Air Freight Dispatch Recommendation
    rec1 = results[0]
    assert rec1["id"] == "rec-1"
    assert rec1["currentRoute"] == "Air Freight Dispatch (10 shipments, 1000.0kg total)"
    assert rec1["recommendedRoute"] == "Express Electric Rail"
    # 1000.0 * 0.85 = 850.0
    assert rec1["carbonSaving"] == 850.0
    assert rec1["costDelta"] == -450
    assert rec1["confidence"] == 0.95

    # 2. Verify Truck Delivery Recommendation
    rec2 = results[1]
    assert rec2["id"] == "rec-2"
    assert rec2["currentRoute"] == "Truck Delivery Transport Dispatch (20 shipments, 500.0kg total)"
    assert rec2["recommendedRoute"] == "Express Electric Rail Delivery"
    # 500.0 * 0.75 = 375.0
    assert rec2["carbonSaving"] == 375.0
    assert rec2["costDelta"] == -150
    assert rec2["confidence"] == 0.90

    # 3. Verify Incineration Disposal Recommendation
    rec3 = results[2]
    assert rec3["id"] == "rec-3"
    assert rec3["currentRoute"] == "Incineration Disposal (5 shipments, 100.0kg total)"
    assert rec3["recommendedRoute"] == "Recycling Processing Facility"
    # 100.0 * 0.70 = 70.0
    assert rec3["carbonSaving"] == 70.0
    assert rec3["costDelta"] == 120
    assert rec3["confidence"] == 0.85

    # 4. Verify Landfill Disposal Recommendation
    rec4 = results[3]
    assert rec4["id"] == "rec-4"
    assert rec4["currentRoute"] == "Landfill Disposal (8 shipments, 200.0kg total)"
    assert rec4["recommendedRoute"] == "Composting & Recycling Facility"
    # 200.0 * 0.60 = 120.0
    assert rec4["carbonSaving"] == 120.0
    assert rec4["costDelta"] == -80
    assert rec4["confidence"] == 0.80

    print("\n--- STANDALONE GREEN ROUTES TEST PASSED ---")
    print(f"Air Freight Saving: {rec1['carbonSaving']} kg (Expected: 850.0)")
    print(f"Truck Delivery Saving: {rec2['carbonSaving']} kg (Expected: 375.0)")
    print(f"Incineration Saving: {rec3['carbonSaving']} kg (Expected: 70.0)")
    print(f"Landfill Saving: {rec4['carbonSaving']} kg (Expected: 120.0)")
    print("-------------------------------------------\n")

if __name__ == "__main__":
    test_standalone()
