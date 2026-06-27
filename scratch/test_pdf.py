import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.set_content("<html><body><h1>Hello PDF from Playwright!</h1></body></html>")
            os.makedirs("scratch", exist_ok=True)
            await page.pdf(path="scratch/test_output.pdf", format="A4")
            await browser.close()
        print("SUCCESS")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(main())
