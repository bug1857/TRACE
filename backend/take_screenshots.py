import os
import sys
import traceback
from playwright.sync_api import sync_playwright

def generate_screenshots():
    artifacts_dir = "/Users/rudrapratapsingh/.gemini/antigravity/brain/113086db-f6ac-42eb-82d6-f3a90b981cf9"
    csv_path = "/Users/rudrapratapsingh/Desktop/TRACE/backend/broken_cols_no_dates.csv"
    
    print("Starting screenshot generation script with detailed logging...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        
        # Log console messages
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err.message}"))
        
        try:
            url = "http://localhost:3000/ocel"
            print(f"Navigating to: {url}")
            page.goto(url)
            page.wait_for_timeout(2000)
            
            print(f"Page Title: {page.title()}")
            
            # Take a screenshot right after loading
            page.screenshot(path=os.path.join(artifacts_dir, "debug_loaded.png"))
            print("Saved debug_loaded.png")
            
            # Check if there is an input element
            inputs = page.query_selector_all('input[type="file"]')
            print(f"Found {len(inputs)} file inputs.")
            if len(inputs) == 0:
                print("HTML content:")
                print(page.content()[:1000])
                
            # Upload
            print(f"Uploading file: {csv_path}")
            page.set_input_files('input[type="file"]', csv_path)
            page.wait_for_timeout(1000)
            
            # Check button
            buttons = page.query_selector_all('button')
            print(f"Found {len(buttons)} buttons on page:")
            for b in buttons:
                print(f"  Button text: '{b.inner_text()}'")
                
            # Click
            print("Clicking 'Run Analysis'...")
            page.click('button:has-text("Run Analysis")')
            
            # Wait for 422
            print("Waiting for the 422 error form...")
            page.screenshot(path=os.path.join(artifacts_dir, "debug_after_click.png"))
            page.wait_for_selector('text=Column Mapping Required', timeout=10000)
            page.wait_for_timeout(1000)
            
            form_img_path = os.path.join(artifacts_dir, "mapping_form.png")
            page.screenshot(path=form_img_path)
            print(f"Saved mapping form screenshot to: {form_img_path}")
            
            # Select
            selects = page.query_selector_all('select')
            print(f"Found {len(selects)} select dropdowns.")
            if len(selects) >= 5:
                selects[0].select_option('col_case')
                selects[1].select_option('col_act')
                selects[2].select_option('col_time')
                selects[3].select_option('— None —')
                selects[4].select_option('— None —')
            
            page.wait_for_timeout(1000)
            
            page.click('button:has-text("Confirm & Upload")')
            print("Clicking 'Confirm & Upload'...")
            
            page.wait_for_selector('text=Analysis Completed', timeout=10000)
            page.wait_for_timeout(2000)
            
            success_img_path = os.path.join(artifacts_dir, "success_graph.png")
            page.screenshot(path=success_img_path)
            print(f"Saved success graph screenshot to: {success_img_path}")
            
        except Exception as e:
            print(f"EXCEPTION OCCURRED: {str(e)}")
            traceback.print_exc()
            page.screenshot(path=os.path.join(artifacts_dir, "debug_exception.png"))
            print("Saved debug_exception.png")
        finally:
            browser.close()

if __name__ == "__main__":
    generate_screenshots()
