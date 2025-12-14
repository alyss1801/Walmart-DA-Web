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

# Dimensions (load TRƯỚC để Power BI detect relationships)
DIM_CUSTOMER = conn.execute("SELECT * FROM DIM_CUSTOMER ORDER BY customer_key").fetchdf()
DIM_PRODUCT = conn.execute("SELECT * FROM DIM_PRODUCT ORDER BY product_key").fetchdf()
DIM_DATE = conn.execute("SELECT * FROM DIM_DATE ORDER BY date_key").fetchdf()
DIM_PAYMENT = conn.execute("SELECT * FROM DIM_PAYMENT ORDER BY payment_key").fetchdf()
DIM_CATEGORY = conn.execute("SELECT * FROM DIM_CATEGORY ORDER BY category_key").fetchdf()

# Fact table (load SAU dimensions)
FACT_SALES = conn.execute("SELECT * FROM FACT_SALES").fetchdf()

# ===========================================
# STAR SCHEMA 2: Store Performance (2010-2012)
# ===========================================

# Dimensions (load trước)
DIM_STORE = conn.execute("SELECT * FROM DIM_STORE ORDER BY store_key").fetchdf()
DIM_DATE_STORE = conn.execute("SELECT * FROM DIM_DATE_STORE ORDER BY date_key").fetchdf()
DIM_TEMPERATURE = conn.execute("SELECT * FROM DIM_TEMPERATURE ORDER BY temp_category_key").fetchdf()

# Fact table (load sau)
FACT_STORE_PERFORMANCE = conn.execute("SELECT * FROM FACT_STORE_PERFORMANCE").fetchdf()

# ===========================================
# STAR SCHEMA 3: E-commerce (2019)
# ===========================================

# Dimensions (load trước)
DIM_ECOMMERCE_PRODUCT = conn.execute("SELECT * FROM DIM_ECOMMERCE_PRODUCT ORDER BY ecommerce_product_key").fetchdf()
DIM_ECOMMERCE_CATEGORY = conn.execute("SELECT * FROM DIM_ECOMMERCE_CATEGORY ORDER BY ecommerce_category_key").fetchdf()
DIM_ECOMMERCE_BRAND = conn.execute("SELECT * FROM DIM_ECOMMERCE_BRAND ORDER BY brand_key").fetchdf()

# Fact table (load sau)
FACT_ECOMMERCE_SALES = conn.execute("SELECT * FROM FACT_ECOMMERCE_SALES").fetchdf()

conn.close()

# ===========================================
# Power BI sẽ tự động detect các DataFrames này
# Mỗi DataFrame → 1 table trong Power BI
# ===========================================
