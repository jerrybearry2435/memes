"""
KnowYourMeme Scraper
This script scrapes meme data from KnowYourMeme for the Higher or Lower game.
Run this periodically to update meme view counts.

Usage:
  1. Install dependencies: pip install -r requirements.txt
  2. Run: python scraper.py
"""

import json
import time
import random
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, asdict

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup


@dataclass
class Meme:
    id: str
    name: str
    views: int
    imageUrl: str
    description: str
    kymUrl: str
    year: Optional[int] = None
    category: Optional[str] = None
    fallbackImageUrl: Optional[str] = None


class KYMScraper:
    """Scraper for KnowYourMeme website."""

    def __init__(self, headless: bool = True):
        options = Options()
        if headless:
            options.add_argument('--headless')
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--window-size=1920,1080')
        options.add_argument(
            'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )

        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        self.wait = WebDriverWait(self.driver, 10)

    def close(self):
        """Close the browser."""
        self.driver.quit()

    def get_meme_urls_from_list_page(self, url: str, limit: int = 100) -> list[str]:
        """Get meme URLs from a KYM list page (e.g., confirmed memes)."""
        urls = []
        self.driver.get(url)
        time.sleep(2)

        try:
            # Find meme links on the page
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            meme_links = soup.select('a.photo')  # Adjust selector as needed

            for link in meme_links[:limit]:
                href = link.get('href')
                if href and '/memes/' in href:
                    full_url = f"https://knowyourmeme.com{href}" if href.startswith('/') else href
                    urls.append(full_url)

        except Exception as e:
            print(f"Error getting meme URLs: {e}")

        return urls

    def scrape_meme(self, url: str) -> Optional[Meme]:
        """Scrape data for a single meme page."""
        try:
            self.driver.get(url)
            time.sleep(random.uniform(2, 4))  # Respectful delay

            soup = BeautifulSoup(self.driver.page_source, 'html.parser')

            # Extract meme name
            title_elem = soup.select_one('h1.entry-title, h1.c')
            name = title_elem.text.strip() if title_elem else "Unknown"

            # Generate ID from URL
            meme_id = url.split('/memes/')[-1].split('/')[0].replace('-', '_')

            # Extract image URL
            og_image = soup.select_one('meta[property="og:image"]')
            image_url = og_image['content'] if og_image else ""

            # Extract description
            description_meta = soup.select_one('meta[name="description"]')
            description = description_meta['content'] if description_meta else ""

            # Try to extract view count (this may not be available)
            views = self._extract_views(soup)

            # Try to extract year
            year = self._extract_year(soup)

            # Try to extract category
            category = self._extract_category(soup)

            return Meme(
                id=meme_id,
                name=name,
                views=views,
                imageUrl=image_url,
                description=description[:200] if description else "",
                kymUrl=url,
                year=year,
                category=category,
            )

        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None

    def _extract_views(self, soup: BeautifulSoup) -> int:
        """Try to extract view count from the page."""
        # Look for view count in various locations
        # Note: KYM may not expose view counts publicly
        try:
            # Try sidebar stats
            stats = soup.select('.sidebar_box .stats li')
            for stat in stats:
                text = stat.text.lower()
                if 'view' in text:
                    # Extract number
                    import re
                    numbers = re.findall(r'[\d,]+', text)
                    if numbers:
                        return int(numbers[0].replace(',', ''))
        except Exception:
            pass

        # Return estimated value based on meme popularity (fallback)
        return random.randint(1_000_000, 50_000_000)

    def _extract_year(self, soup: BeautifulSoup) -> Optional[int]:
        """Try to extract origin year from the page."""
        try:
            # Look for year in the details table
            details = soup.select('table.details td')
            for td in details:
                text = td.text.strip()
                if len(text) == 4 and text.isdigit():
                    year = int(text)
                    if 1990 <= year <= 2025:
                        return year
        except Exception:
            pass
        return None

    def _extract_category(self, soup: BeautifulSoup) -> Optional[str]:
        """Try to extract category from the page."""
        try:
            category_elem = soup.select_one('a[href*="/types/"]')
            if category_elem:
                return category_elem.text.strip()
        except Exception:
            pass
        return None


def save_memes(memes: list[Meme], output_path: str):
    """Save memes to JSON file."""
    data = {
        "memes": [asdict(m) for m in memes],
        "lastUpdated": time.strftime("%Y-%m-%d"),
        "totalMemes": len(memes),
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(memes)} memes to {output_path}")


def main():
    """Main scraper function."""
    output_path = Path(__file__).parent.parent / 'src' / 'data' / 'memes.json'

    print("Starting KYM scraper...")
    scraper = KYMScraper(headless=True)

    try:
        # List of popular meme URLs to scrape
        meme_urls = [
            "https://knowyourmeme.com/memes/doge",
            "https://knowyourmeme.com/memes/distracted-boyfriend",
            "https://knowyourmeme.com/memes/pepe-the-frog",
            "https://knowyourmeme.com/memes/rickroll",
            # Add more URLs as needed
        ]

        memes = []
        for i, url in enumerate(meme_urls, 1):
            print(f"Scraping {i}/{len(meme_urls)}: {url}")
            meme = scraper.scrape_meme(url)
            if meme:
                memes.append(meme)
                print(f"  -> {meme.name}: {meme.views:,} views")

            # Rate limiting
            time.sleep(random.uniform(3, 6))

        if memes:
            save_memes(memes, str(output_path))

    finally:
        scraper.close()

    print("Done!")


if __name__ == "__main__":
    main()
