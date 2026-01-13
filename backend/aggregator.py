
import httpx
import logging
import sqlite3
import json
import os
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database file path
DB_PATH = "markets.db"

# Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")  # Set via environment variable

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    with open("schema.sql", "r") as f:
        schema = f.read()
    cursor.executescript(schema)
    conn.commit()
    conn.close()

def tag_market_with_keywords(text: str) -> List[str]:
    """Tags markets with country codes using comprehensive keyword matching."""
    # Expanded keyword dictionary with 50+ countries and entities
    COUNTRY_KEYWORDS = {
        "USA": ["USA", "US", "United States", "America", "American", "Trump", "Biden", "Harris", "White House", "Congress", "Fed", "Federal Reserve", "Pentagon", "Washington", "Elon", "DOGE", "Federal"],
        "IRN": ["Iran", "Iranian", "Tehran", "Khamenei"],
        "CHN": ["China", "Chinese", "Xi Jinping", "Beijing", "CCP", "PRC"],
        "RUS": ["Russia", "Russian", "Putin", "Moscow", "Kremlin"],
        "UKR": ["Ukraine", "Ukrainian", "Kyiv", "Kiev", "Zelenskyy"],
        "ISR": ["Israel", "Israeli", "Netanyahu", "Gaza", "Tel Aviv", "IDF"],
        "PSE": ["Palestine", "Palestinian"],
        "GBR": ["UK", "United Kingdom", "Britain", "British", "Starmer", "Sunak", "London"],
        "DEU": ["Germany", "German", "Berlin", "Scholz"],
       "FRA": ["France", "French", "Paris", "Macron"],
        "ITA": ["Italy", "Italian", "Rome"],
        "ESP": ["Spain", "Spanish", "Madrid"],
        "JPN": ["Japan", "Japanese", "Tokyo", "BOJ"],
        "KOR": ["Korea", "Korean", "Seoul", "Kim Jong"],
        "PRK": ["North Korea", "DPRK"],
        "IND": ["India", "Indian", "Delhi", "Modi"],
        "PAK": ["Pakistan", "Pakistani"],
        "BRA": ["Brazil", "Brazilian", "Brasilia"],
        "MEX": ["Mexico", "Mexican"],
        "CAN": ["Canada", "Canadian", "Ottawa", "Trudeau"],
        "AUS": ["Australia", "Australian"],
        "NZL": ["New Zealand"],
        "ZAF": ["South Africa"],
        "EGY": ["Egypt", "Egyptian"],
        "SAU": ["Saudi Arabia", "Saudi"],
        "ARE": ["UAE", "Dubai", "Emirates"],
        "TUR": ["Turkey", "Turkish", "Erdogan", "Istanbul"],
        "GRL": ["Greenland"],
        "TWN": ["Taiwan", "Taiwanese", "Taipei"],
        "VNM": ["Vietnam", "Vietnamese"],
        "THA": ["Thailand", "Thai"],
        "IDN": ["Indonesia", "Indonesian"],
        "PHL": ["Philippines", "Filipino"],
        "SGP": ["Singapore"],
        "MYS": ["Malaysia", "Malaysian"],
        "EU": ["EU", "European Union", "Eurozone", "ECB"],
        "SYR": ["Syria", "Syrian"],
        "IRQ": ["Iraq", "Iraqi", "Baghdad"],
        "AFG": ["Afghanistan", "Afghan", "Kabul", "Taliban"],
        "YEM": ["Yemen", "Yemeni"],
        "LBN": ["Lebanon", "Lebanese", "Hezbollah"],
        "JOR": ["Jordan", "Jordanian"],
        "KWT": ["Kuwait"],
        "QAT": ["Qatar"],
        "OMN": ["Oman"],
        "BHR": ["Bahrain"],
        "POL": ["Poland", "Polish", "Warsaw"],
        "CZE": ["Czech"],
        "HUN": ["Hungary", "Hungarian"],
        "ROU": ["Romania", "Romanian"],
        "GRC": ["Greece", "Greek", "Athens"],
        "PRT": ["Portugal", "Portuguese"],
        "SWE": ["Sweden", "Swedish"],
        "NOR": ["Norway", "Norwegian"],
        "DNK": ["Denmark", "Danish"],
        "FIN": ["Finland", "Finnish"],
        "NLD": ["Netherlands", "Dutch"],
        "BEL": ["Belgium", "Belgian"],
        "CHE": ["Switzerland", "Swiss"],
        "AUT": ["Austria", "Austrian"],
        "ARG": ["Argentina", "Argentine"],
        "CHL": ["Chile", "Chilean"],
        "COL": ["Colombia", "Colombian"],
        "VEN": ["Venezuela", "Venezuelan"],
        "PER": ["Peru", "Peruvian"],
    }
    
    related_countries = []
    text_lower = text.lower()
    
    for country_code, keywords in COUNTRY_KEYWORDS.items():
        for keyword in keywords:
            if keyword.lower() in text_lower:
                related_countries.append(country_code)
                break
                
    return list(set(related_countries))  # Remove duplicates

def tag_market_fallback(text: str) -> List[str]:
    """Fallback keyword-based tagging."""
    COUNTRY_KEYWORDS = {
        "USA": ["USA", "US", "United States", "America", "Trump", "Biden", "Harris"],
        "IRN": ["Iran", "Iranian"],
        "CHN": ["China", "Xi Jinping", "Beijing", "Chinese"],
        "RUS": ["Russia", "Putin", "Moscow", "Russian"],
        "UKR": ["Ukraine", "Kyiv", "Zelenskyy", "Ukrainian"],
        "ISR": ["Israel", "Netanyahu", "Gaza", "Israeli"],
        "GBR": ["UK", "United Kingdom", "Britain", "Starmer"],
        "DEU": ["Germany", "Berlin", "Scholz", "German"],
        "FRA": ["France", "Paris", "Macron", "French"],
        "JPN": ["Japan", "Tokyo", "Japanese"],
        "KOR": ["Korea", "Seoul", "Korean"],
        "IND": ["India", "Delhi", "Modi", "Indian"],
        "BRA": ["Brazil", "Brasilia", "Brazilian"],
        "MEX": ["Mexico", "Mexican"],
        "CAN": ["Canada", "Canadian"],
        "AUS": ["Australia", "Australian"],
        "NZL": ["New Zealand"],
        "ZAF": ["South Africa"],
        "EGY": ["Egypt", "Egyptian"],
        "SAU": ["Saudi Arabia", "Saudi"],
        "ARE": ["UAE", "Dubai", "Emirates"],
        "TUR": ["Turkey", "Turkish", "Erdogan"],
        "GRL": ["Greenland"],
        "TWN": ["Taiwan", "Taipei"],
        "PRK": ["North Korea", "DPRK", "Kim Jong"],
        "VNM": ["Vietnam", "Vietnamese"],
        "THA": ["Thailand", "Thai"],
        "IDN": ["Indonesia", "Indonesian"],
        "PHL": ["Philippines", "Filipino"],
        "SGP": ["Singapore"],
        "MYS": ["Malaysia", "Malaysian"],
    }
    
    related_countries = []
    text_lower = text.lower()
    
    for country_code, keywords in COUNTRY_KEYWORDS.items():
        for keyword in keywords:
            if keyword.lower() in text_lower:
                related_countries.append(country_code)
                break
                
    return related_countries

async def fetch_polymarket() -> List[Dict[str, Any]]:
    # Fetch Events instead of just Markets for better linking and grouping
    url = "https://gamma-api.polymarket.com/events?active=true&closed=false&limit=100"
    markets = []
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            for event in data:
                event_slug = event.get("slug", "")
                
                # Each event has multiple markets (usually just 1 for simple binary)
                for item in event.get("markets", []):
                    if not item.get("question"):
                        continue
                        
                    question = item["question"]
                    
                    # Handle outcomePrices
                    outcome_prices = item.get("outcomePrices", "[]")
                    try:
                        if isinstance(outcome_prices, str):
                            outcome_prices = json.loads(outcome_prices)
                        yes_price = float(outcome_prices[0]) if outcome_prices else 0.0
                    except (ValueError, IndexError, json.JSONDecodeError):
                        yes_price = 0.0

                    markets.append({
                        "id": f"poly_{item.get('id', item.get('conditionId', question))}",
                        "source": "Polymarket",
                        "question": question,
                        "probability": yes_price * 100,
                        "outcomes": item.get("outcomes", '["Yes", "No"]'),
                        "clob_token_ids": item.get("clobTokenIds", "[]"),
                        "slug": event_slug, # Linking to the EVENT page is best
                        "price_change_24h": item.get("priceChange24h", 0.0),
                    })
                
    except Exception as e:
        logger.error(f"Error fetching Polymarket: {e}")
        
    return markets

async def fetch_kalshi() -> List[Dict[str, Any]]:
    url = "https://api.elections.kalshi.com/trade-api/v2/events?status=open&limit=200"
    markets = []
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            events = data.get("events", [])
            
            for event in events:
                title = event.get("title")
                if not title:
                    continue
                
                yes_price = event.get("yes_price")
                if yes_price is None and "markets" in event and event["markets"]:
                    yes_price = event["markets"][0].get("yes_price", 0)
                
                if yes_price is None:
                    continue

                prob = float(yes_price)
                if prob <= 1.0:
                    prob *= 100

                markets.append({
                    "id": f"kalshi_{event.get('event_ticker')}",
                    "source": "Kalshi",
                    "question": title,
                    "probability": prob,
                    "outcomes": '["Yes", "No"]', # Kalshi events are mostly binary in this endpoint
                    "slug": event.get("event_ticker", ""),
                    "price_change_24h": 0.0, # Will need deeper dive for Kalshi performance
                })

    except Exception as e:
        logger.error(f"Error fetching Kalshi: {e}")

    return markets

async def fetch_polymarket_history(clob_token_id: str) -> List[Dict[str, Any]]:
    """Fetches price history for a specific Polymarket token."""
    import asyncio
    await asyncio.sleep(1.0) # Conservative rate limit for CLOB history
    # 'max' interval with '1440' fidelity (daily) or 'all'
    url = f"https://clob.polymarket.com/prices-history?market={clob_token_id}&interval=max&fidelity=1440"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                return data.get("history", [])
    except Exception as e:
        logger.error(f"Error fetching history for {clob_token_id}: {e}")
    return []

async def update_market_history(cursor, market_id: str, clob_token_ids: List[str], outcome_labels: List[str], current_prob: float):
    """Fetches and stores history for each outcome of a market."""
    import datetime
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    if not clob_token_ids or not outcome_labels:
        return

    # We only fetch history for the first outcome to keep it light for now
    for i, token_id in enumerate(clob_token_ids):
        if i >= len(outcome_labels):
            break
            
        label = outcome_labels[i]
        history = await fetch_polymarket_history(token_id)
        logger.info(f"Fetched {len(history)} points for {token_id}")
        
        for point in history:
            ts = point.get("t") # timestamp
            price = point.get("p") # price
            if ts and price is not None:
                import datetime
                dt = datetime.datetime.fromtimestamp(ts, datetime.timezone.utc).isoformat()
                cursor.execute("""
                    INSERT OR REPLACE INTO market_history (market_id, outcome_label, price, timestamp)
                    VALUES (?, ?, ?, ?)
                """, (market_id, label, price * 100, dt))
        
        # This guarantees the graph always reaches 'now' with the current probability
        # We use the current probability from the main market dict to ensure the end point is accurate
        # i==0 is usually 'Yes' or the primary outcome
        if i == 0:
             cursor.execute("""
                INSERT OR REPLACE INTO market_history (market_id, outcome_label, price, timestamp)
                VALUES (?, ?, ?, ?)
             """, (market_id, label, current_prob, now_iso))

async def update_markets():
    logger.info("Starting market update...")
    init_db()
    
    poly_markets = await fetch_polymarket()
    kalshi_markets = await fetch_kalshi()
    all_markets = poly_markets + kalshi_markets
    
    logger.info(f"Fetched {len(poly_markets)} Polymarket + {len(kalshi_markets)} Kalshi = {len(all_markets)} total")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    for m in all_markets:
        # Use keyword tagging
        related = tag_market_with_keywords(m["question"])
        
        if not related:
            logger.debug(f"No countries tagged for: {m['question']}")
        
        # Insert Market
        cursor.execute("""
            INSERT OR REPLACE INTO markets (id, source, question, current_probability, outcomes, clob_token_ids, slug, price_change_24h, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (m["id"], m["source"], m["question"], m["probability"], str(m["outcomes"]), str(m["clob_token_ids"]), m["slug"], m["price_change_24h"]))
        
        # Fetch and store history for Polymarket (only for top few to avoid rate limiting)
        # Actually, let's just do it for all but maybe it's too slow?
        # Let's limit to top 50 markets for now or just do all and see.
        if m["source"] == "Polymarket" and m.get("clob_token_ids"):
            try:
                clob_ids = m["clob_token_ids"]
                if isinstance(clob_ids, str):
                    clob_ids = json.loads(clob_ids.replace("'", '"'))
                
                outcomes = m["outcomes"]
                if isinstance(outcomes, str):
                    outcomes = json.loads(outcomes.replace("'", '"'))
                
                await update_market_history(cursor, m["id"], clob_ids, outcomes, m["probability"])
            except Exception as e:
                logger.error(f"Error updating history for {m['id']}: {e}")

        # Insert Tags
        cursor.execute("DELETE FROM market_tags WHERE market_id = ?", (m["id"],))
        for code in related:
            cursor.execute("INSERT INTO market_tags (market_id, country_code) VALUES (?, ?)", (m["id"], code))
            
        conn.commit()
            
    conn.commit()
    conn.close()
    logger.info(f"Updated {len(all_markets)} markets.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(update_markets())
