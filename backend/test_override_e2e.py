import os
import sys
import json
import traceback
import urllib.request
from playwright.sync_api import sync_playwright

def run_e2e():
    artifacts_dir = "/Users/rudrapratapsingh/.gemini/antigravity/brain/113086db-f6ac-42eb-82d6-f3a90b981cf9"
    csv_path = "/Users/rudrapratapsingh/Desktop/TRACE/trace_demo_dataset.csv"
    
    print("Starting e2e test...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        
        # Log console messages and errors
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err.message}"))
        
        try:
            # 1. Navigate to Settings page
            url = "http://localhost:3000/settings"
            print(f"Navigating to: {url}")
            page.goto(url)
            page.wait_for_timeout(2000)
            
            # 2. Click on Emission Factors tab
            print("Clicking 'Emission Factors' tab...")
            page.click('button[role="tab"]:has-text("Emission Factors")')
            page.wait_for_timeout(1000)
            
            # 3. Edit Air Freight factor from 2.62 to 5.24
            print("Filling Air Freight factor with 5.24...")
            input_selector = 'tr:has-text("Air Freight Dispatch") input[type="number"]'
            page.fill(input_selector, "5.24")
            page.wait_for_timeout(1000)
            
            # 4. Click Save Factors Ledger
            print("Clicking 'Save Factors Ledger'...")
            page.click('button:has-text("Save Factors Ledger")')
            
            # 5. Wait for the green success banner
            print("Waiting for success feedback...")
            page.wait_for_selector('text=Emission factors database saved and synced.', timeout=10000)
            page.wait_for_timeout(1000)
            
            # Take a screenshot of saved settings
            settings_saved_path = os.path.join(artifacts_dir, "settings_saved.png")
            page.screenshot(path=settings_saved_path)
            print(f"Saved settings screenshot to: {settings_saved_path}")
            
            # 6. Navigate to /ocel via sidebar click (client-side routing)
            print("Clicking sidebar link for OCEL 2.0...")
            page.click('a[href="/ocel"]')
            page.wait_for_timeout(2000)
            
            # 7. Upload trace_demo_dataset.csv
            print(f"Uploading file: {csv_path}")
            page.set_input_files('input[type="file"]', csv_path)
            page.wait_for_timeout(1000)
            
            # 8. Click Run Analysis
            print("Clicking 'Run Analysis'...")
            page.click('button:has-text("Run Analysis")')
            
            # 9. Wait for "Analysis Completed" on the upload panel
            print("Waiting for Analysis Completed confirmation...")
            page.wait_for_selector('text=Analysis Completed', timeout=15000)
            page.wait_for_timeout(2000)
            
            # 10. Navigate to /carbon-budget via sidebar click (client-side routing) to preserve context state
            print("Clicking sidebar link for Carbon Budget...")
            page.click('a[href="/carbon-budget"]')
            page.wait_for_timeout(2000)
            
            # 11. Wait for the exact total carbon text: "3,370.6"
            print("Waiting for 3,370.6 kg CO₂e element...")
            page.wait_for_selector('text=3,370.6', timeout=10000)
            page.wait_for_timeout(1000)
            
            # Print the page contents validation
            all_text = page.locator('body').inner_text()
            if "3,370.6" in all_text:
                print("SUCCESS: 3,370.6 kg CO₂e verified on Carbon Budget page!")
            else:
                print("ERROR: Value 3,370.6 kg not found in page body!")
                
            # Take a screenshot of the carbon budget page
            ocel_result_path = os.path.join(artifacts_dir, "ocel_upload_result.png")
            page.screenshot(path=ocel_result_path)
            print(f"Saved ocel result screenshot to: {ocel_result_path}")
            
            # 12. Cleanup: reset factor back to 2.62
            print("Performing cleanup: resetting air_freight factor back to 2.62...")
            cleanup_payload = json.dumps({"air_freight": 2.62}).encode("utf-8")
            req = urllib.request.Request(
                "http://localhost:8000/api/emission-factors",
                data=cleanup_payload,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req) as res:
                if res.status == 200:
                    print("SUCCESS: Cleanup completed, air_freight reset to 2.62.")
                else:
                    print(f"WARNING: Cleanup failed with status {res.status}")
            
        except Exception as e:
            print(f"EXCEPTION OCCURRED: {str(e)}")
            traceback.print_exc()
            page.screenshot(path=os.path.join(artifacts_dir, "e2e_exception.png"))
            print("Saved e2e_exception.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run_e2e()
