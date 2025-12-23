# World Bank Indicator Mappings

## Activity & Output
- **Real GDP (% y/y)**: `NY.GDP.MKTP.KD.ZG`
- **Nominal GDP (USD)**: `NY.GDP.MKTP.CD`
- **GDP per capita (USD)**: `NY.GDP.PCAP.CD`
- **Private Consumption (% y/y)**: `NE.CON.PRVT.KD.ZG`
- **Fixed Investment (% y/y)**: `NE.GDI.FTOT.KD.ZG`
- **Population**: `SP.POP.TOTL`

## External Sector
- **Current Account (% GDP)**: `BN.CAB.XOKA.GD.ZS`
- **Net FDI (% GDP)**: `BX.KLT.DINV.WD.GD.ZS`
- **External Debt (% GNI)**: `DT.DOD.DECT.GN.ZS` (Proxy for % GDP)
- **FX Reserves (USD)**: `FI.RES.TOTL.CD`
- **Import Coverage (Months)**: `FI.RES.TOTL.MO`

## Public Sector
- **Fiscal Balance (% GDP)**: `GC.BAL.CASH.GD.ZS`
- **Gov Debt (% GDP)**: `GC.DOD.TOTL.GD.ZS` (Central Gov)

## Prices & Monetary
- **CPI (% y/y)**: `FP.CPI.TOTL.ZG`
- **Real Interest Rate (%)**: `FR.INR.RINR`
- **Exchange Rate (LCU/USD)**: `PA.NUS.FCRF`

## Specialized / Missing in Public API
- **Breakeven Oil Price**: Not available publically (requires IMF/Energy Intelligence).
- **Energy Subsidies**: Not standard.
- **Credit Ratings**: Not in WB API (Proprietary). Mocked.
- **Banking Capital**: `FB.BNK.CAPA.ZS` (Capital to Assets).
