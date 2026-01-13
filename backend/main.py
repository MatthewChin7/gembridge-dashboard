from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from contextlib import asynccontextmanager
import sqlite3
import json
import os
import logging
from typing import List, Dict, Any, Optional
import random
import numpy as np
from scipy.interpolate import interp1d

from aggregator import update_markets, DB_PATH, init_db
from bbg_service import bbg_service
from quant_engine import SovereignRVEngine, get_nss_curve_points

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing database...")
    init_db()
    
    # Initialize scheduler
    scheduler = AsyncIOScheduler()
    scheduler.add_job(update_markets, 'interval', minutes=10)
    scheduler.start()
    
    # Run an initial update immediately (optional, or wait for first interval)
    # await update_markets() 
    
    yield
    
    # Shutdown
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/")
def read_root():
    return {"status": "ok", "service": "Market Intelligence API"}

@app.get("/markets/{country_code}", response_model=List[Dict[str, Any]])
def get_markets_by_country(country_code: str):
    """
    Fetch active markets for a specific country code (ISO-3166-1 alpha-3).
    Example: /markets/USA
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT m.id, m.source, m.question, m.current_probability, m.outcomes, m.slug, m.price_change_24h, m.last_updated 
        FROM markets m
        JOIN market_tags t ON m.id = t.market_id
        WHERE t.country_code = ?
        ORDER BY m.current_probability DESC
    """
    
    cursor.execute(query, (country_code.upper(),))
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        results.append({
            "id": row["id"],
            "source": row["source"],
            "question": row["question"],
            "probability": row["current_probability"],
            "outcomes": row["outcomes"],
            "slug": row["slug"],
            "price_change_24h": row["price_change_24h"],
            "last_updated": row["last_updated"]
        })
        
    return results

@app.get("/history/{market_id}")
async def get_market_history(market_id: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT outcome_label, price, timestamp 
        FROM market_history 
        WHERE market_id = ? 
        ORDER BY timestamp ASC
    """, (market_id,))
    rows = cursor.fetchall()
    conn.close()
    
    # Reformat for Recharts: list of {timestamp, Label1, Label2...}
    history_map = {}
    for label, price, ts in rows:
        if ts not in history_map:
            history_map[ts] = {"timestamp": ts}
        history_map[ts][label] = price
        
    return sorted(history_map.values(), key=lambda x: x["timestamp"])

# --- CREDIT DASHBOARD ENDPOINTS ---

@app.get("/credit/bonds/{country}")
async def get_sovereign_bonds(country: str):
    """Fetches bond universe and calculates RV metrics."""
    # 1. Fetch data from BBG
    bonds = bbg_service.fetch_bond_data([])
    is_mock = not bbg_service.is_connected
    
    if not bonds:
        return []
        
    # 2. Fit NSS Curve
    maturities = [b["maturity"] for b in bonds]
    yields = [b["yield"] for b in bonds]
    
    engine = SovereignRVEngine()
    params = engine.fit_curve(maturities, yields)
    
    # 3. Calculate metrics
    for b in bonds:
        b["is_mock"] = is_mock
        if params is not None:
            fitted = float(engine.nss_model(np.array([b["maturity"]]), *params)[0])
            b["fitted_yield"] = fitted
            b["residual"] = round((b["yield"] - fitted) * 100, 1) # In bps
            # Mock Z-score until we have historical residual database
            b["z_score"] = round(random.uniform(-3, 3), 2)
        else:
            b["fitted_yield"] = 0
            b["residual"] = 0
            b["z_score"] = 0
            
    return bonds

@app.get("/credit/curve/{country}")
async def get_sovereign_curve(country: str, type: str = "NSS"):
    """Returns points for drawing the fair-value curve."""
    bonds = bbg_service.fetch_bond_data([])
    maturities = [b["maturity"] for b in bonds]
    yields = [b["yield"] for b in bonds]
    
    engine = SovereignRVEngine()
    
    if type == "NSS":
        params = engine.fit_curve(maturities, yields)
        points = get_nss_curve_points(params)
        return {"points": points, "is_mock": not bbg_service.is_connected}
    elif type == "CDS":
        cds_data = bbg_service.fetch_cds_data(country)
        tenors = [c["tenor"] for c in cds_data]
        spreads = [c["spread"] / 100 for c in cds_data] # bps to %
        rf = 4.5 # Risk-free proxy
        
        f = interp1d(tenors, spreads, kind='linear', fill_value='extrapolate')
        m_range = np.linspace(0.1, 30, 100)
        points = [{"maturity": float(m), "y": float(f(m)) + rf} for m in m_range]
        return {"points": points, "is_mock": not bbg_service.is_connected}
        
    return []

@app.post("/trigger-update")
async def trigger_update():
    """Manual trigger to update markets immediately."""
    await update_markets()
    return {"status": "update triggered"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
