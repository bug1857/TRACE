"""
TRACE Copilot Full Matrix Audit
Tests: 3 models × 4 styles × 4 queries = 48 combinations
Outputs: terminal summary + JSON report + markdown report
"""

import urllib.request
import urllib.error
import json
import time
import re
import sys
from datetime import datetime

# ─── Config ──────────────────────────────────────────────────────────────────
BACKEND_URL = "http://localhost:8000"
OLLAMA_URL  = "http://localhost:11434"
TIMEOUT_SEC = 45          # per-call timeout (qwen3-vl is slow with big ctx)

MODELS  = ["gemma3:4b", "qwen2.5:1.5b", "qwen3-vl:4b"]
STYLES  = ["balanced", "numerical", "executive", "formal"]
QUERIES = [
    "Which variant is most carbon-efficient?",
    "Days until budget breach?",
    "Worst performing supplier?",
    "Top conformance violations?",
]

# Minimal realistic context (mirrors what the frontend sends)
MOCK_CONTEXT = {
    "metadata": {
        "filename": "trace_demo_dataset.csv",
        "caseCount": 800,
        "totalEvents": 4232,
        "activityCount": 10
    },
    "totalCarbonKg": 78430,
    "violations": [
        {"caseId": "C001", "activity": "Air Freight Dispatch", "severity": "CRITICAL",
         "carbonExcessKg": 366.8, "mandatedAlternative": "Express Electric Rail"},
        {"caseId": "C002", "activity": "Truck Delivery Transport Dispatch", "severity": "HIGH",
         "carbonExcessKg": 84.15, "mandatedAlternative": "Express Electric Rail"},
        {"caseId": "C003", "activity": "Incineration Disposal", "severity": "MEDIUM",
         "carbonExcessKg": 20.3, "mandatedAlternative": "Recycling Processing Facility"},
    ],
    "supplierFitness": [
        {"supplier": "FedEx Air", "avgCfsScore": 42, "violationCount": 140, "totalCarbonKg": 42000, "caseCount": 200},
        {"supplier": "DHL Express", "avgCfsScore": 58, "violationCount": 95, "totalCarbonKg": 22000, "caseCount": 180},
        {"supplier": "BlueDart Rail", "avgCfsScore": 91, "violationCount": 12, "totalCarbonKg": 5800, "caseCount": 150},
    ],
    "carbonBudget": [
        {"month": "Jan 2026", "actualKg": 6200, "cumulativeKg": 6200, "limitKg": 10833},
        {"month": "Feb 2026", "actualKg": 7100, "cumulativeKg": 13300, "limitKg": 10833},
        {"month": "Mar 2026", "actualKg": 8900, "cumulativeKg": 22200, "limitKg": 10833},
    ],
    "esgReport": {
        "environmental": {"score": 72.0, "totalCarbonKg": 55800, "carbonBudgetStatus": "WITHIN_LIMIT"},
        "governance": {"score": 60.0, "violationCount": 368},
        "overallScore": 66.0
    }
}

# ─── HTTP helpers ─────────────────────────────────────────────────────────────
def post_json(url, payload, timeout=TIMEOUT_SEC):
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8")), r.status

def get_json(url, timeout=5):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))

# ─── Pre-flight ───────────────────────────────────────────────────────────────
print("\n" + "═"*70)
print("  TRACE COPILOT FULL MATRIX AUDIT")
print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("═"*70)

# 1. Check Ollama
print("\n[PRE-FLIGHT] Checking Ollama...")
try:
    tags = get_json(f"{OLLAMA_URL}/api/tags", timeout=3)
    avail = [m["name"] for m in tags.get("models", [])]
    print(f"  ✅  Ollama online  |  models: {avail}")
except Exception as e:
    print(f"  ❌  Ollama offline: {e}")
    sys.exit(1)

# 2. Check backend
print("[PRE-FLIGHT] Checking TRACE backend...")
try:
    status = get_json(f"{BACKEND_URL}/health", timeout=3)
    print(f"  ✅  Backend online  |  {status}")
except Exception as e:
    print(f"  ❌  Backend offline: {e}")
    sys.exit(1)

# 3. Check copilot status endpoint
print("[PRE-FLIGHT] Checking /api/copilot/status...")
try:
    cs = get_json(f"{BACKEND_URL}/api/copilot/status", timeout=4)
    print(f"  ✅  Copilot status: online={cs.get('online')}  models={cs.get('availableModels')}")
except Exception as e:
    print(f"  ❌  Status endpoint failed: {e}")

print()

# ─── MATRIX TEST ──────────────────────────────────────────────────────────────
TOTAL    = len(MODELS) * len(STYLES) * len(QUERIES)
results  = []
passed   = 0
failed   = 0
timeouts = 0
n        = 0

print(f"Running {TOTAL} test combinations ({len(MODELS)} models × {len(STYLES)} styles × {len(QUERIES)} queries)...\n")
print(f"{'#':<4} {'Model':<18} {'Style':<12} {'Query':<42} {'Status':<10} {'Latency':<10} {'Words'}")
print("-"*115)

for model in MODELS:
    for style in STYLES:
        for query in QUERIES:
            n += 1
            start = time.time()
            status_str = ""
            latency_ms = 0
            word_count = 0
            answer_preview = ""
            error_msg = ""

            try:
                payload = {
                    "query":   query,
                    "model":   model,
                    "style":   style,
                    "context": MOCK_CONTEXT
                }
                resp, http_status = post_json(f"{BACKEND_URL}/api/copilot/query", payload, timeout=TIMEOUT_SEC)
                latency_ms = int((time.time() - start) * 1000)

                if http_status == 200:
                    answer = resp.get("answer", "")
                    if answer and len(answer.strip()) > 10:
                        # Strip thinking tags
                        answer = re.sub(r'<think>.*?</think>', '', answer, flags=re.DOTALL).strip()
                        word_count = len(answer.split())
                        answer_preview = answer[:80].replace('\n', ' ')
                        status_str = "✅ PASS"
                        passed += 1
                    else:
                        status_str = "⚠️  EMPTY"
                        error_msg = "Empty or very short answer"
                        failed += 1
                elif http_status == 503:
                    status_str = "🔴 503"
                    error_msg = resp.get("detail", "Ollama offline")
                    failed += 1
                else:
                    status_str = f"⚠️  {http_status}"
                    error_msg = str(resp)
                    failed += 1

            except urllib.error.HTTPError as e:
                latency_ms = int((time.time() - start) * 1000)
                body = e.read().decode() if e.fp else ""
                try:
                    detail = json.loads(body).get("detail", body)
                except:
                    detail = body[:100]
                if e.code == 503:
                    status_str = "🔴 503-OFFLINE"
                elif e.code == 500:
                    status_str = "🔴 500-ERROR"
                else:
                    status_str = f"🔴 HTTP-{e.code}"
                error_msg = detail
                failed += 1

            except urllib.error.URLError as e:
                latency_ms = int((time.time() - start) * 1000)
                if "timed out" in str(e).lower() or isinstance(e.reason, TimeoutError):
                    status_str = "⏱️  TIMEOUT"
                    timeouts += 1
                else:
                    status_str = "🔴 CONN-ERR"
                    failed += 1
                error_msg = str(e.reason)

            except Exception as e:
                latency_ms = int((time.time() - start) * 1000)
                status_str = "🔴 EXCEPTION"
                error_msg = str(e)[:80]
                failed += 1

            # Store result
            results.append({
                "n": n,
                "model": model,
                "style": style,
                "query": query,
                "status": status_str,
                "latency_ms": latency_ms,
                "word_count": word_count,
                "answer_preview": answer_preview,
                "error": error_msg
            })

            q_short = query[:40]
            lat_str = f"{latency_ms}ms"
            print(f"{n:<4} {model:<18} {style:<12} {q_short:<42} {status_str:<15} {lat_str:<10} {word_count}")

            # Small delay between calls to avoid hammering Ollama
            time.sleep(0.3)

# ─── SUMMARY ─────────────────────────────────────────────────────────────────
print("\n" + "═"*70)
print(f"  RESULTS SUMMARY")
print("═"*70)
print(f"  Total tests : {TOTAL}")
print(f"  ✅ Passed   : {passed}  ({passed/TOTAL*100:.0f}%)")
print(f"  ❌ Failed   : {failed}")
print(f"  ⏱️  Timeouts : {timeouts}")
print()

# Per-model breakdown
print("  Per-model breakdown:")
for model in MODELS:
    m_results = [r for r in results if r["model"] == model]
    m_pass  = sum(1 for r in m_results if "PASS" in r["status"])
    m_fail  = sum(1 for r in m_results if "PASS" not in r["status"])
    m_lats  = [r["latency_ms"] for r in m_results if r["latency_ms"] > 0]
    avg_lat = int(sum(m_lats)/len(m_lats)) if m_lats else 0
    avg_wds = int(sum(r["word_count"] for r in m_results if r["word_count"] > 0) / max(1, sum(1 for r in m_results if r["word_count"] > 0)))
    print(f"    {model:<20}  pass={m_pass}/{len(m_results)}  avg_lat={avg_lat}ms  avg_words={avg_wds}")

print()
print("  Per-style breakdown:")
for style in STYLES:
    s_results = [r for r in results if r["style"] == style]
    s_pass = sum(1 for r in s_results if "PASS" in r["status"])
    s_lats = [r["latency_ms"] for r in s_results if "PASS" in r["status"]]
    avg_lat = int(sum(s_lats)/len(s_lats)) if s_lats else 0
    print(f"    {style:<12}  pass={s_pass}/{len(s_results)}  avg_lat={avg_lat}ms")

print()
print("  Failures detail:")
for r in results:
    if "PASS" not in r["status"]:
        print(f"    [{r['status']}] {r['model']} | {r['style']} | {r['query'][:35]}")
        if r["error"]:
            print(f"              → {r['error'][:100]}")

# ─── SAVE REPORTS ─────────────────────────────────────────────────────────────
ts = datetime.now().strftime("%Y%m%d_%H%M%S")

# JSON
json_path = f"/Users/rudrapratapsingh/Desktop/TRACE/copilot_audit_{ts}.json"
with open(json_path, "w") as f:
    json.dump({
        "timestamp": ts,
        "summary": {"total": TOTAL, "passed": passed, "failed": failed, "timeouts": timeouts},
        "results": results
    }, f, indent=2)

# Markdown
md_path = f"/Users/rudrapratapsingh/Desktop/TRACE/copilot_audit_{ts}.md"
with open(md_path, "w") as f:
    f.write(f"# TRACE Copilot Full Matrix Audit\n\n")
    f.write(f"**Run at:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
    f.write(f"**Models:** {', '.join(MODELS)}\n\n")
    f.write(f"**Styles:** {', '.join(STYLES)}\n\n")
    f.write(f"**Queries:** {len(QUERIES)} test questions\n\n")
    f.write(f"**Total combinations:** {TOTAL}\n\n")
    f.write(f"---\n\n## Summary\n\n")
    f.write(f"| Metric | Value |\n|---|---|\n")
    f.write(f"| ✅ Passed | {passed} / {TOTAL} ({passed/TOTAL*100:.0f}%) |\n")
    f.write(f"| ❌ Failed | {failed} |\n")
    f.write(f"| ⏱️ Timeouts | {timeouts} |\n\n")

    f.write(f"## Per-Model Performance\n\n")
    f.write(f"| Model | Pass | Avg Latency | Avg Words |\n|---|---|---|---|\n")
    for model in MODELS:
        m_results = [r for r in results if r["model"] == model]
        m_pass = sum(1 for r in m_results if "PASS" in r["status"])
        m_lats = [r["latency_ms"] for r in m_results if "PASS" in r["status"]]
        avg_lat = int(sum(m_lats)/len(m_lats)) if m_lats else 0
        avg_wds = int(sum(r["word_count"] for r in m_results if r["word_count"] > 0) / max(1, sum(1 for r in m_results if r["word_count"] > 0)))
        f.write(f"| {model} | {m_pass}/{len(m_results)} | {avg_lat}ms | {avg_wds} |\n")

    f.write(f"\n## Full Results\n\n")
    f.write(f"| # | Model | Style | Query | Status | Latency | Words | Preview |\n")
    f.write(f"|---|---|---|---|---|---|---|---|\n")
    for r in results:
        preview = r["answer_preview"][:60].replace("|", "\\|") if r["answer_preview"] else r["error"][:60].replace("|","\\|")
        f.write(f"| {r['n']} | {r['model']} | {r['style']} | {r['query'][:35]} | {r['status']} | {r['latency_ms']}ms | {r['word_count']} | {preview} |\n")

    f.write(f"\n## Failures Detail\n\n")
    failures = [r for r in results if "PASS" not in r["status"]]
    if not failures:
        f.write("No failures! All tests passed.\n")
    else:
        for r in failures:
            f.write(f"### {r['model']} | {r['style']} | {r['query']}\n\n")
            f.write(f"- **Status:** {r['status']}\n")
            f.write(f"- **Latency:** {r['latency_ms']}ms\n")
            f.write(f"- **Error:** {r['error']}\n\n")

print(f"\n  📄 JSON report: {json_path}")
print(f"  📄 MD  report : {md_path}")
print("\n" + "═"*70 + "\n")
