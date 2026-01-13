import logging
import json
import random
import datetime

logger = logging.getLogger(__name__)

# Try to import blpapi, but don't fail if it's missing (allows demo/mock mode)
try:
    import blpapi
    BLPAPI_AVAILABLE = True
except ImportError:
    BLPAPI_AVAILABLE = False
    logger.warning("blpapi not installed. Bloomberg service will run in MOCK mode.")

class BloombergService:
    def __init__(self, host="localhost", port=8194):
        self.host = host
        self.port = port
        self.session = None
        self.is_connected = False

    def start_session(self):
        if not BLPAPI_AVAILABLE:
            return False
            
        try:
            sessionOptions = blpapi.SessionOptions()
            sessionOptions.setServerHost(self.host)
            sessionOptions.setServerPort(self.port)
            
            self.session = blpapi.Session(sessionOptions)
            if not self.session.start():
                logger.error("Failed to start Bloomberg session.")
                return False
                
            if not self.session.openService("//blp/refdata"):
                logger.error("Failed to open //blp/refdata service.")
                return False
                
            self.is_connected = True
            logger.info("Successfully connected to Bloomberg B-PIPE.")
            return True
        except Exception as e:
            logger.error(f"Error starting Bloomberg session: {e}")
            return False

    def fetch_bond_data(self, isins):
        """Fetches reference and real-time data for a list of ISINs."""
        if not self.is_connected:
            return self._mock_bond_data(isins)
            
        # Real BLPAPI logic would go here
        # Request: YLD_YTM_MID, Z_SPD_MID, PX_LAST, MATURITY, COUPON, etc.
        return self._mock_bond_data(isins)

    def fetch_cds_data(self, country_code):
        """Fetches Par CDS curve for a sovereign."""
        if not self.is_connected:
            return self._mock_cds_data(country_code)
            
        return self._mock_cds_data(country_code)

    def _mock_bond_data(self, isins):
        """Generates realistic synthetic bond data for demonstration."""
        results = []
        # Realistic yield curve for a generic EM country (e.g. 5-8%)
        base_yield = 5.0
        
        # We'll generate 15-20 bonds if isins is empty/generic
        if not isins or len(isins) < 5:
            # Generate a synthetic universe for Brazil/EM
            maturities = [1, 2, 3, 5, 7, 10, 15, 20, 25, 30]
            for m in maturities:
                # Add some noise to make it realistic
                y = base_yield + (m ** 0.5) * 0.5 + random.uniform(-0.1, 0.1)
                z_spread = 200 + m * 5 + random.uniform(-10, 10)
                
                results.append({
                    "isin": f"US{random.randint(100000, 999999)}",
                    "ticker": f"BRAZIL {random.randint(2, 12)} {2025 + m}",
                    "maturity": m,
                    "yield": y,
                    "z_spread": z_spread,
                    "price": 100 - (y - 5.0) * 8, # Simple price proxy
                    "coupon": random.choice([3.5, 4.25, 5.0, 6.125, 8.25]),
                    "bid_ask": random.uniform(0.05, 0.2)
                })
        return results

    def _mock_cds_data(self, country_code):
        """Synthetic Par CDS curve: (tenor, spread_bps)."""
        return [
            {"tenor": 1, "spread": 120},
            {"tenor": 3, "spread": 150},
            {"tenor": 5, "spread": 185},
            {"tenor": 7, "spread": 210},
            {"tenor": 10, "spread": 240}
        ]

# Global singleton or per-request instance
bbg_service = BloombergService()
