import requests
import time

url = "http://localhost:8000/api/ocel/upload"
file_path = "/Users/rudrapratapsingh/Desktop/TRACE/trace_100k.csv"

print(f"Uploading {file_path} to {url}...")
start_time = time.time()
with open(file_path, "rb") as f:
    files = {"file": (file_path.split("/")[-1], f, "text/csv")}
    try:
        response = requests.post(url, files=files)
        elapsed = time.time() - start_time
        print(f"Status Code: {response.status_code}")
        print(f"Time Taken: {elapsed:.2f} seconds")
        if response.status_code == 200:
            data = response.json()
            print(f"Metadata: {data.get('metadata')}")
            print(f"Total Carbon: {data.get('totalCarbonKg')}")
            print(f"Nodes: {len(data.get('nodes', []))}, Edges: {len(data.get('edges', []))}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
