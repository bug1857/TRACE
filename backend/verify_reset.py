import os
import sys
import traceback
from playwright.sync_api import sync_playwright

def run_verify():
    artifacts_dir = "/Users/rudrapratapsingh/.gemini/antigravity/brain/113086db-f6ac-42eb-82d6-f3a90b981cf9"
    csv_path = "/Users/rudrapratapsingh/Desktop/TRACE/trace_demo_dataset.csv"
    
    print("Starting reset verification test...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        
        try:
            # 1. Navigate to Settings page first to confirm input shows 2.62
            page.goto("http://localhost:3000/settings")
            page.wait_for_timeout(2000)
            page.click('button[role="tab"]:has-text("Emission Factors")')
            page.wait_for_timeout(1000)
            
            val = page.eval_on_selector('tr:has-text("Air Freight Dispatch") input[type="number"]', "el => el.value")
            print(f"Current UI Air Freight value: {val}")
            
            # 2. Navigate to /ocel
            print("Navigating to OCEL 2.0...")
            page.click('a[href="/ocel"]')
            page.wait_for_timeout(2000)
            
            # 3. Upload file
            print(f"Uploading file: {csv_path}")
            page.set_input_files('input[type="file"]', csv_path)
            page.wait_for_timeout(1000)
            
            # 4. Click Run Analysis
            print("Clicking 'Run Analysis'...")
            page.click('button:has-text("Run Analysis")')
            
            # 5. Wait for Analysis Completed
            print("Waiting for Analysis Completed confirmation...")
            page.wait_for_selector('text=Analysis Completed', timeout=15000)
            page.wait_for_timeout(2000)
            
            # 6. Navigate to /carbon-budget
            print("Clicking sidebar link for Carbon Budget...")
            page.click('a[href="/carbon-budget"]')
            page.wait_for_timeout(2000)
            
            # 7. Wait for 3,003.8
            print("Waiting for 3,003.8 kg CO₂e element...")
            page.wait_for_selector('text=3,003.8', timeout=10000)
            page.wait_for_timeout(1000)
            
            all_text = page.locator('body').inner_text()
            if "3,003.8" in all_text:
                print("VERIFY SUCCESS: 3,003.8 kg CO₂e verified on Carbon Budget page!")
            else:
                print("VERIFY ERROR: Value 3,003.8 kg not found in page body!")
                
            page.screenshot(path=os.path.join(artifacts_dir, "reset_verified.png"))
            print("Saved reset_verified.png screenshot.")
            
        except Exception as e:
            print(f"EXCEPTION OCCURRED: {str(e)}")
            traceback.print_exc()
            page.screenshot(path=os.path.join(artifacts_dir, "verify_exception.png"))
        finally:
            browser.close()

if __name__ == "__main__":
    run_verify()
