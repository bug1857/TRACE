"""
Generate a synthetic OCEL supply chain event log — ~100,000 rows.
Columns: case_id, activity, timestamp, resource, supplier_name
"""
import csv
import random
from datetime import datetime, timedelta

random.seed(42)

SUPPLIERS = [
    "EcoLink Carriers", "GreenRoute Logistics", "FastFreight India",
    "BlueSky Cargo", "SwiftShip Co", "NovaTrans Ltd", "PrimeLogix",
    "OceanBridge Express", "AirEx Global", "RailFirst Freight",
    "TransIndus Corp", "EarthMove Logistics", "ClearPath Shipping",
    "VeloFreight", "NexusCarry", "IronHorse Transport", "SkyBound Air",
    "GroundForce Ltd", "TradeWind Carriers", "PacificLink Logistics"
]
RESOURCES = [f"R-Ops{i}" for i in range(1, 31)]

STANDARD_SEQUENCE = ["Order Received","Warehouse Pick & Pack","Customs Clearance","Road Transport Dispatch","Port Handling","Last Mile Delivery"]
AIR_SEQUENCE      = ["Order Received","Warehouse Pick & Pack","Customs Clearance","Air Freight Dispatch","Port Handling","Last Mile Delivery"]
TRUCK_SEQUENCE    = ["Order Received","Warehouse Pick & Pack","Quality Inspection","Truck Delivery Transport Dispatch","Last Mile Delivery"]
RAIL_SEQUENCE     = ["Order Received","Warehouse Pick & Pack","Customs Clearance","Rail Freight Dispatch","Sorting Hub Transfer","Last Mile Delivery"]
OCEAN_SEQUENCE    = ["Order Received","Warehouse Pick & Pack","Customs Clearance","Ocean Freight Dispatch","Port Handling","Sorting Hub Transfer","Last Mile Delivery"]
RECYCLING_LEG     = ["Waste Collection","Recycling Processing"]
INCINERATION_LEG  = ["Waste Collection","Incineration Disposal"]
LANDFILL_LEG      = ["Waste Collection","Landfill Disposal"]

TRANSPORT_TEMPLATES = [(STANDARD_SEQUENCE,0.40),(AIR_SEQUENCE,0.20),(TRUCK_SEQUENCE,0.15),(RAIL_SEQUENCE,0.15),(OCEAN_SEQUENCE,0.10)]
WASTE_TEMPLATES     = [(RECYCLING_LEG,0.60),(INCINERATION_LEG,0.25),(LANDFILL_LEG,0.15)]

def pick(templates):
    r, cumul = random.random(), 0.0
    for t, w in templates:
        cumul += w
        if r < cumul: return t
    return templates[-1][0]

def generate_case(n, start):
    cid = f"CASE-{n:06d}"
    sup = random.choice(SUPPLIERS)
    res = random.choice(RESOURCES)
    acts = list(pick(TRANSPORT_TEMPLATES))
    if random.random() < 0.40:
        acts += pick(WASTE_TEMPLATES)
    events, t = [], start
    for a in acts:
        events.append({"case_id":cid,"activity":a,"timestamp":t.strftime("%Y-%m-%dT%H:%M:%SZ"),"resource":res,"supplier_name":sup})
        t += timedelta(hours=random.randint(1,48))
    return events

def main():
    NUM_CASES = 17000
    start_window = datetime(2024,1,1,6,0,0)
    window_sec   = int((datetime(2025,12,31,23,0,0)-start_window).total_seconds())
    out = "/Users/rudrapratapsingh/Desktop/TRACE/trace_100k.csv"
    total = 0
    with open(out,"w",newline="",encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["case_id","activity","timestamp","resource","supplier_name"])
        w.writeheader()
        for i in range(1, NUM_CASES+1):
            evs = generate_case(i, start_window + timedelta(seconds=random.randint(0,window_sec)))
            w.writerows(evs)
            total += len(evs)
    print(f"Done. Cases: {NUM_CASES:,} | Rows: {total:,} | File: {out}")

if __name__ == "__main__":
    main()
