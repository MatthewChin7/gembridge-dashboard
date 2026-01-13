import numpy as np
import pandas as pd
from scipy.optimize import minimize
from scipy.interpolate import interp1d
import logging

logger = logging.getLogger(__name__)

class SovereignRVEngine:
    def __init__(self, maturities=None, yields=None):
        self.maturities = np.array(maturities) if maturities is not None else np.array([])
        self.yields = np.array(yields) if yields is not None else np.array([])
        self.params = None

    def nss_model(self, m, b0, b1, b2, b3, t1, t2):
        """Nelson-Siegel-Svensson (NSS) model for the yield curve."""
        m = np.array(m)
        # Prevent division by zero
        m = np.where(m <= 0, 1e-6, m)
        
        term1 = b1 * (1 - np.exp(-m/t1)) / (m/t1)
        term2 = b2 * ((1 - np.exp(-m/t1)) / (m/t1) - np.exp(-m/t1))
        term3 = b3 * ((1 - np.exp(-m/t2)) / (m/t2) - np.exp(-m/t2))
        
        return b0 + term1 + term2 + term3

    def objective(self, p, maturities, yields):
        """Sum of squared errors (SSE) objective function."""
        fitted = self.nss_model(maturities, *p)
        return np.sum((yields - fitted)**2)

    def fit_curve(self, maturities, yields):
        """Optimizes NSS parameters to fit the provided market yields."""
        maturities = np.array(maturities)
        yields = np.array(yields)
        if len(maturities) < 6:
            logger.warning("Fewer than 6 points provided for NSS fit. Results may be unstable.")
        
        # Initial guesses: [b0, b1, b2, b3, t1, t2]
        # b0: Long-term (usually near the last yield)
        # b1: Short-term (spread between short and long)
        x0 = [yields[-1], yields[0] - yields[-1], 0.0, 0.0, 1.0, 5.0]
        
        # Bounds to keep parameters realistic
        # t1 and t2 MUST be positive
        bounds = [
            (0, 20),      # b0 (Yields > 20% are rare/distressed but possible)
            (-20, 20),    # b1
            (-20, 20),    # b2
            (-20, 20),    # b3
            (0.1, 30.0),  # t1
            (0.1, 30.0)   # t2
        ]
        
        res = minimize(self.objective, x0, args=(maturities, yields), bounds=bounds, method='L-BFGS-B')
        
        if not res.success:
            logger.error(f"NSS fit failed: {res.message}")
            return None
            
        self.params = res.x
        return self.params

    def get_fair_value_cds(self, bond_maturity, cds_tenors, cds_spreads, risk_free_rate=0.0):
        """Interpolates Par CDS curve to find risk-neutral Fair Value yield."""
        if not cds_tenors or not cds_spreads:
            return None
            
        f = interp1d(cds_tenors, cds_spreads, kind='linear', fill_value="extrapolate")
        cds_premium = float(f(bond_maturity))
        
        # Fair Value Yield = Risk-Free + CDS Spread (simplified)
        return risk_free_rate + (cds_premium / 10000.0) # Assume CDS in bps

    def calculate_rv_metrics(self, current_df, history_df=None):
        """
        Calculates Z-score and percentile for bond residuals.
        current_df needs: ['isin', 'maturity', 'actual_yield', 'fitted_yield']
        """
        current_df['residual'] = (current_df['actual_yield'] - current_df['fitted_yield']) * 100 # In bps
        
        if history_df is not None:
            # history_df should have 'isin', 'date', 'residual'
            # Calculate Z-score based on 90-day window
            # Percentile based on 250-day window
            pass # Implementation depends on how history is stored
            
        return current_df

def get_nss_curve_points(params, max_maturity=30):
    """Generates points along the fitted curve for UI plotting."""
    if params is None: return []
    
    m_range = np.linspace(0.1, max_maturity, 100)
    engine = SovereignRVEngine()
    y_values = engine.nss_model(m_range, *params)
    
    return [{"maturity": float(m), "y": float(y)} for m, y in zip(m_range, y_values)]

if __name__ == "__main__":
    # Simple test
    test_m = np.array([1, 2, 5, 10, 20, 30])
    test_y = np.array([2.5, 2.7, 3.2, 4.0, 4.5, 4.8])
    
    engine = SovereignRVEngine()
    params = engine.fit_curve(test_m, test_y)
    print(f"Fitted Params: {params}")
    
    points = get_nss_curve_points(params)
    print(f"Curve Points (first 5): {points[:5]}")
