"""
Power BI Python Script - Direct Load
Copy script này vào Power BI Desktop → Get Data → Python Script
"""

# ============================================
# COPY CODE DƯỚI ĐÂY VÀO POWER BI
# ============================================

import duckdb
import pandas as pd

# Path to DuckDB
db_path = r"D:\DA_pipeline\DA\database\walmart_analytics.db"
conn = duckdb.connect(db_path, read_only=True)

# ===========================================
# STAR SCHEMA 1: Retail Sales (2024-2025)
# ===========================================

# Fact table
FACT_SALES = conn.execute("SELECT * FROM FACT_SALES").fetchdf()

# Dimensions
DIM_PRODUCT = conn.execute("SELECT * FROM DIM_PRODUCT").fetchdf()
DIM_CUSTOMER = conn.execute("SELECT * FROM DIM_CUSTOMER").fetchdf()
DIM_DATE = conn.execute("SELECT * FROM DIM_DATE").fetchdf()
DIM_PAYMENT = conn.execute("SELECT * FROM DIM_PAYMENT").fetchdf()
DIM_CATEGORY = conn.execute("SELECT * FROM DIM_CATEGORY").fetchdf()

# ===========================================
# STAR SCHEMA 2: Store Performance (2010-2012)
# ===========================================

FACT_STORE_PERFORMANCE = conn.execute("SELECT * FROM FACT_STORE_PERFORMANCE").fetchdf()
DIM_STORE = conn.execute("SELECT * FROM DIM_STORE").fetchdf()
DIM_DATE_STORE = conn.execute("SELECT * FROM DIM_DATE_STORE").fetchdf()
DIM_TEMPERATURE = conn.execute("SELECT * FROM DIM_TEMPERATURE").fetchdf()

# ===========================================
# STAR SCHEMA 3: E-commerce (2019)
# ===========================================

FACT_ECOMMERCE_SALES = conn.execute("SELECT * FROM FACT_ECOMMERCE_SALES").fetchdf()
DIM_ECOMMERCE_PRODUCT = conn.execute("SELECT * FROM DIM_ECOMMERCE_PRODUCT").fetchdf()
DIM_ECOMMERCE_CATEGORY = conn.execute("SELECT * FROM DIM_ECOMMERCE_CATEGORY").fetchdf()
DIM_ECOMMERCE_BRAND = conn.execute("SELECT * FROM DIM_ECOMMERCE_BRAND").fetchdf()

conn.close()

# ===========================================
# Power BI sẽ tự động detect các DataFrames này
# Mỗi DataFrame → 1 table trong Power BI
# ===========================================
