"""
TRACE Dataset Generator
-----------------------
Run this script each time you want to add fresh data to your CSV.
Every run appends NEW rows — no duplicates, no repeated case IDs.

Usage:
    python generate_dataset.py                  # appends 50 cases (default)
    python generate_dataset.py --cases 100      # appends 100 cases
    python generate_dataset.py --output my.csv  # custom file path
    python generate_dataset.py --reset          # wipe file and start fresh

Output columns (TRACE-compatible):
    case_id, activity, timestamp, resource, carbon_kg, cost_usd, duration_min
"""

import argparse
import csv
import os
import random
import uuid
from datetime import datetime, timedelta

# ── CONFIG ────────────────────────────────────────────────────────────────────

DEFAULT_OUTPUT = "trace_dataset.csv"
DEFAULT_CASES  = 500

ACTIVITIES = [
    "Supplier Onboarding",
    "Raw Material Procurement",
    "Quality Inspection",
    "Warehouse Storage",
    "Production Planning",
    "Manufacturing Run",
    "Packaging",
    "Carbon Audit",
    "Logistics Dispatch",
    "Customs Clearance",
    "Last-Mile Delivery",
    "Invoice Processing",
    "Payment Settlement",
    "Returns Processing",
    "ESG Compliance Review",
]

# Activities that commonly trigger a violation in TRACE's conformance rules
VIOLATION_ACTIVITIES = {
    "Raw Material Procurement",
    "Manufacturing Run",
    "Logistics Dispatch",
    "Customs Clearance",
}

RESOURCES = [
    "Alice Sharma", "Bob Mehra", "Carol Nair", "David Rao",
    "Eva Singh", "Frank Patel", "Grace Iyer", "Haruto Tanaka",
    "Iris Chen", "Jatin Verma", "Kavya Reddy", "Liam Okafor",
]

# Carbon kg range per activity (min, max)
CARBON_RANGES = {
    "Supplier Onboarding":       (0.5,  2.0),
    "Raw Material Procurement":  (8.0, 35.0),
    "Quality Inspection":        (0.3,  1.5),
    "Warehouse Storage":         (1.0,  5.0),
    "Production Planning":       (0.2,  1.0),
    "Manufacturing Run":         (20.0, 80.0),
    "Packaging":                 (1.5,  6.0),
    "Carbon Audit":              (0.1,  0.5),
    "Logistics Dispatch":        (10.0, 45.0),
    "Customs Clearance":         (2.0,  8.0),
    "Last-Mile Delivery":        (3.0, 12.0),
    "Invoice Processing":        (0.1,  0.4),
    "Payment Settlement":        (0.05, 0.2),
    "Returns Processing":        (4.0, 15.0),
    "ESG Compliance Review":     (0.2,  1.0),
}

COST_RANGES = {
    "Supplier Onboarding":       (200,   800),
    "Raw Material Procurement":  (1500,  8000),
    "Quality Inspection":        (100,   400),
    "Warehouse Storage":         (300,   1200),
    "Production Planning":       (150,   600),
    "Manufacturing Run":         (3000, 15000),
    "Packaging":                 (200,   700),
    "Carbon Audit":              (500,  2000),
    "Logistics Dispatch":        (800,  3500),
    "Customs Clearance":         (400,  1800),
    "Last-Mile Delivery":        (200,   900),
    "Invoice Processing":        (50,    200),
    "Payment Settlement":        (30,    150),
    "Returns Processing":        (300,  1200),
    "ESG Compliance Review":     (600,  2500),
}

DURATION_RANGES = {
    "Supplier Onboarding":       (60,  240),
    "Raw Material Procurement":  (30,   90),
    "Quality Inspection":        (15,   60),
    "Warehouse Storage":         (120, 480),
    "Production Planning":       (45,  180),
    "Manufacturing Run":         (90,  360),
    "Packaging":                 (20,   60),
    "Carbon Audit":              (60,  240),
    "Logistics Dispatch":        (180, 720),
    "Customs Clearance":         (120, 480),
    "Last-Mile Delivery":        (60,  300),
    "Invoice Processing":        (10,   30),
    "Payment Settlement":        (5,    20),
    "Returns Processing":        (30,  120),
    "ESG Compliance Review":     (90,  300),
}

# ── HELPERS ───────────────────────────────────────────────────────────────────

def load_existing_case_ids(filepath: str) -> set:
    """Read all existing case_ids from the CSV to prevent duplicates."""
    existing = set()
    if not os.path.exists(filepath):
        return existing
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames and "case_id" in reader.fieldnames:
            for row in reader:
                existing.add(row["case_id"])
    return existing


def generate_case_id(existing_ids: set) -> str:
    """Generate a guaranteed-unique case ID."""
    while True:
        cid = f"CASE-{uuid.uuid4().hex[:8].upper()}"
        if cid not in existing_ids:
            existing_ids.add(cid)
            return cid


def random_timestamp(start: datetime, max_offset_days: int = 365) -> datetime:
    """Return a random timestamp within the past year from start."""
    offset = timedelta(
        days=random.randint(0, max_offset_days),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
        seconds=random.randint(0, 59),
    )
    return start - offset


def build_case_events(case_id: str, base_time: datetime) -> list[dict]:
    """
    Build a realistic sequence of events for one case.
    - Always starts with Supplier Onboarding or Raw Material Procurement
    - Always ends with Payment Settlement or ESG Compliance Review
    - Middle activities are randomly sampled (3–8 steps), no immediate repeats
    - Timestamps are strictly increasing within the case
    """
    start_activities  = ["Supplier Onboarding", "Raw Material Procurement"]
    end_activities    = ["Payment Settlement", "ESG Compliance Review"]
    middle_pool       = [a for a in ACTIVITIES
                         if a not in start_activities and a not in end_activities]

    first   = random.choice(start_activities)
    last    = random.choice(end_activities)
    n_mid   = random.randint(3, 8)
    middle  = []
    prev    = first
    for _ in range(n_mid):
        choices = [a for a in middle_pool if a != prev]
        pick    = random.choice(choices)
        middle.append(pick)
        prev    = pick

    sequence = [first] + middle + [last]

    events = []
    current_time = random_timestamp(base_time)
    for activity in sequence:
        duration = random.randint(*DURATION_RANGES[activity])
        carbon   = round(random.uniform(*CARBON_RANGES[activity]), 3)
        cost     = round(random.uniform(*COST_RANGES[activity]), 2)

        # Add noise: ~20% of violation-prone activities get elevated carbon
        if activity in VIOLATION_ACTIVITIES and random.random() < 0.20:
            carbon = round(carbon * random.uniform(1.3, 2.0), 3)

        events.append({
            "case_id":      case_id,
            "activity":     activity,
            "timestamp":    current_time.strftime("%Y-%m-%d %H:%M:%S"),
            "resource":     random.choice(RESOURCES),
            "carbon_kg":    carbon,
            "cost_usd":     cost,
            "duration_min": duration,
        })
        current_time += timedelta(minutes=duration + random.randint(5, 60))

    return events


# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="TRACE dataset generator")
    parser.add_argument("--cases",  type=int, default=DEFAULT_CASES,
                        help=f"Number of new cases to append (default: {DEFAULT_CASES})")
    parser.add_argument("--output", type=str, default=DEFAULT_OUTPUT,
                        help=f"Output CSV file path (default: {DEFAULT_OUTPUT})")
    parser.add_argument("--reset",  action="store_true",
                        help="Delete existing file and start fresh")
    args = parser.parse_args()

    filepath = args.output

    if args.reset and os.path.exists(filepath):
        os.remove(filepath)
        print(f"[reset] Deleted {filepath}")

    # Load existing case IDs to prevent any duplication
    existing_ids  = load_existing_case_ids(filepath)
    file_exists   = os.path.exists(filepath)
    base_time     = datetime.now()

    fieldnames = [
        "case_id", "activity", "timestamp",
        "resource", "carbon_kg", "cost_usd", "duration_min"
    ]

    new_rows = 0
    with open(filepath, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)

        # Write header only if file is new / was reset
        if not file_exists or args.reset:
            writer.writeheader()

        for _ in range(args.cases):
            case_id = generate_case_id(existing_ids)
            events  = build_case_events(case_id, base_time)
            for event in events:
                writer.writerow(event)
                new_rows += 1

    total_cases = len(existing_ids)
    print(f"[done] Appended {args.cases} cases ({new_rows} events) → {filepath}")
    print(f"[info] Total unique cases in file: {total_cases}")


if __name__ == "__main__":
    main()
