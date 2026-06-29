import requests
import json

url = "http://localhost:8000/api/ocel/upload"
file_path = "/Users/rudrapratapsingh/Desktop/TRACE/trace_100k.csv"

with open(file_path, "rb") as f:
    files = {"file": (file_path.split("/")[-1], f, "text/csv")}
    try:
        res = requests.post(url, files=files)
        data = res.json()
        print("Payload Keys:", data.keys())
        print("Violations count:", len(data.get("violations", [])))
        print("CFS Scores count:", len(data.get("cfsScores", [])))
        print("Supplier Fitness count:", len(data.get("supplierFitness", [])))
        
        payload_size_mb = len(json.dumps(data)) / (1024 * 1024)
        print(f"Total JSON Payload Size: {payload_size_mb:.2f} MB")
    except Exception as e:
        print(f"Error: {e}")
