"""
Power BI Python Data Connector
==============================
Script này dùng để load dữ liệu từ DuckDB vào Power BI.

CÁCH SỬ DỤNG TRONG POWER BI:
1. Home → Get Data → Python script
2. Copy toàn bộ code bên dưới vào
3. Chọn DataFrame cần import

LƯU Ý: Đảm bảo đã cài đặt: pip install duckdb pandas
"""

import duckdb
import pandas as pd
from pathlib import Path

# ============================================================
# CẤU HÌNH ĐƯỜNG DẪN
# ============================================================
# Thay đổi đường dẫn này theo máy của bạn
DB_PATH = r"D:\DA_pipeline\DA\database\walmart_analytics.db"

# Kiểm tra file tồn tại
if not Path(DB_PATH).exists():
    raise FileNotFoundError(f"Database không tồn tại: {DB_PATH}")

# Kết nối DuckDB
conn = duckdb.connect(DB_PATH, read_only=True)

# ============================================================
# STAR SCHEMA 1: FACT_SALES + DIMENSIONS
# ============================================================

# Fact Sales với tất cả dimensions
FACT_SALES = conn.execute("""
    SELECT 
        fs.sale_id,
        fs.customer_key,
        fs.product_key,
        fs.date_key,
        fs.payment_key,
        fs.purchase_amount,
        fs.quantity,
        fs.rating,
        fs.created_at,
        
        -- DIM_CUSTOMER
        dc.customer_id,
        dc.customer_name,
        dc.gender,
        dc.age,
        dc.age_group,
        dc.city,
        dc.state,
        
        -- DIM_PRODUCT  
        dp.product_id,
        dp.product_name,
        dp.category_name,
        dp.brand,
        
        -- DIM_DATE
        dd.full_date,
        dd.year,
        dd.month,
        dd.month_name,
        dd.day,
        dd.day_name,
        dd.quarter,
        dd.is_weekend,
        
        -- DIM_PAYMENT
        dpm.payment_method
        
    FROM FACT_SALES fs
    LEFT JOIN DIM_CUSTOMER dc ON fs.customer_key = dc.customer_key
    LEFT JOIN DIM_PRODUCT dp ON fs.product_key = dp.product_key
    LEFT JOIN DIM_DATE dd ON fs.date_key = dd.date_key
    LEFT JOIN DIM_PAYMENT dpm ON fs.payment_key = dpm.payment_key
""").df()

# ============================================================
# STAR SCHEMA 2: FACT_STORE_PERFORMANCE + DIMENSIONS
# ============================================================

FACT_STORE_PERFORMANCE = conn.execute("""
    SELECT 
        fsp.performance_id,
        fsp.store_key,
        fsp.date_key,
        fsp.temperature_key,
        fsp.weekly_sales,
        fsp.fuel_price,
        fsp.cpi,
        fsp.unemployment,
        fsp.holiday_flag,
        
        -- DIM_STORE
        ds.store_id,
        ds.store_name,
        ds.store_type,
        ds.store_size,
        ds.region,
        
        -- DIM_DATE
        dd.full_date,
        dd.year,
        dd.month,
        dd.month_name,
        dd.week_of_year,
        dd.quarter,
        dd.is_weekend,
        
        -- DIM_TEMPERATURE
        dt.temperature,
        dt.temp_category
        
    FROM FACT_STORE_PERFORMANCE fsp
    LEFT JOIN DIM_STORE ds ON fsp.store_key = ds.store_key
    LEFT JOIN DIM_DATE dd ON fsp.date_key = dd.date_key
    LEFT JOIN DIM_TEMPERATURE dt ON fsp.temperature_key = dt.temperature_key
""").df()

# ============================================================
# STAR SCHEMA 3: FACT_PRODUCT_CATALOG
# ============================================================

FACT_PRODUCT_CATALOG = conn.execute("""
    SELECT 
        fpc.catalog_id,
        fpc.product_key,
        fpc.category_key,
        fpc.list_price,
        fpc.sale_price,
        fpc.discount_pct,
        fpc.rating AS product_rating,
        fpc.reviews_count,
        fpc.is_available,
        
        -- DIM_PRODUCT
        dp.product_id,
        dp.product_name,
        dp.brand,
        
        -- DIM_CATEGORY
        dcat.category_name,
        dcat.sub_category
        
    FROM FACT_PRODUCT_CATALOG fpc
    LEFT JOIN DIM_PRODUCT dp ON fpc.product_key = dp.product_key
    LEFT JOIN DIM_CATEGORY dcat ON fpc.category_key = dcat.category_key
""").df()

# ============================================================
# DIMENSION TABLES (Standalone)
# ============================================================

DIM_CUSTOMER = conn.execute("SELECT * FROM DIM_CUSTOMER").df()
DIM_PRODUCT = conn.execute("SELECT * FROM DIM_PRODUCT").df()
DIM_DATE = conn.execute("SELECT * FROM DIM_DATE").df()
DIM_PAYMENT = conn.execute("SELECT * FROM DIM_PAYMENT").df()
DIM_STORE = conn.execute("SELECT * FROM DIM_STORE").df()
DIM_TEMPERATURE = conn.execute("SELECT * FROM DIM_TEMPERATURE").df()
DIM_CATEGORY = conn.execute("SELECT * FROM DIM_CATEGORY").df()

# ============================================================
# AGGREGATED VIEWS (Tối ưu cho Dashboard)
# ============================================================

# Revenue by Month
REVENUE_BY_MONTH = conn.execute("""
    SELECT 
        dd.year,
        dd.month,
        dd.month_name,
        SUM(fs.purchase_amount) as total_revenue,
        COUNT(*) as total_orders,
        AVG(fs.purchase_amount) as avg_order_value,
        AVG(fs.rating) as avg_rating
    FROM FACT_SALES fs
    JOIN DIM_DATE dd ON fs.date_key = dd.date_key
    GROUP BY dd.year, dd.month, dd.month_name
    ORDER BY dd.year, dd.month
""").df()

# Revenue by Category
REVENUE_BY_CATEGORY = conn.execute("""
    SELECT 
        dp.category_name,
        SUM(fs.purchase_amount) as total_revenue,
        COUNT(*) as total_orders,
        AVG(fs.rating) as avg_rating
    FROM FACT_SALES fs
    JOIN DIM_PRODUCT dp ON fs.product_key = dp.product_key
    GROUP BY dp.category_name
    ORDER BY total_revenue DESC
""").df()

# Sales by Temperature
SALES_BY_TEMPERATURE = conn.execute("""
    SELECT 
        dt.temp_category,
        AVG(fsp.weekly_sales) as avg_weekly_sales,
        SUM(fsp.weekly_sales) as total_sales,
        COUNT(*) as weeks_count
    FROM FACT_STORE_PERFORMANCE fsp
    JOIN DIM_TEMPERATURE dt ON fsp.temperature_key = dt.temperature_key
    GROUP BY dt.temp_category
    ORDER BY avg_weekly_sales DESC
""").df()

# Holiday Impact
HOLIDAY_IMPACT = conn.execute("""
    SELECT 
        CASE WHEN holiday_flag = 1 THEN 'Holiday' ELSE 'Non-Holiday' END as period,
        AVG(weekly_sales) as avg_weekly_sales,
        SUM(weekly_sales) as total_sales,
        COUNT(*) as weeks_count
    FROM FACT_STORE_PERFORMANCE
    GROUP BY holiday_flag
""").df()

# Store Performance Ranking
STORE_RANKING = conn.execute("""
    SELECT 
        ds.store_name,
        ds.store_type,
        ds.region,
        SUM(fsp.weekly_sales) as total_sales,
        AVG(fsp.weekly_sales) as avg_weekly_sales,
        COUNT(*) as weeks_count
    FROM FACT_STORE_PERFORMANCE fsp
    JOIN DIM_STORE ds ON fsp.store_key = ds.store_key
    GROUP BY ds.store_name, ds.store_type, ds.region
    ORDER BY total_sales DESC
""").df()

# Customer Demographics
CUSTOMER_DEMOGRAPHICS = conn.execute("""
    SELECT 
        dc.age_group,
        dc.gender,
        COUNT(DISTINCT dc.customer_key) as customer_count,
        SUM(fs.purchase_amount) as total_revenue,
        AVG(fs.purchase_amount) as avg_order_value
    FROM FACT_SALES fs
    JOIN DIM_CUSTOMER dc ON fs.customer_key = dc.customer_key
    GROUP BY dc.age_group, dc.gender
    ORDER BY dc.age_group, dc.gender
""").df()

# Payment Methods
PAYMENT_METHODS = conn.execute("""
    SELECT 
        dpm.payment_method,
        COUNT(*) as transaction_count,
        SUM(fs.purchase_amount) as total_revenue,
        AVG(fs.purchase_amount) as avg_transaction
    FROM FACT_SALES fs
    JOIN DIM_PAYMENT dpm ON fs.payment_key = dpm.payment_key
    GROUP BY dpm.payment_method
    ORDER BY total_revenue DESC
""").df()

# Đóng kết nối
conn.close()

# ============================================================
# DANH SÁCH DATAFRAMES CÓ SẴN CHO POWER BI
# ============================================================
"""
DataFrames có sẵn để import vào Power BI:

FACT TABLES (Full):
- FACT_SALES              : 50,000 rows - Sales với tất cả dimensions
- FACT_STORE_PERFORMANCE  : 6,435 rows - Store performance với dimensions
- FACT_PRODUCT_CATALOG    : Products với category info

DIMENSION TABLES:
- DIM_CUSTOMER            : Customer master data
- DIM_PRODUCT             : Product master data  
- DIM_DATE                : Date dimension
- DIM_PAYMENT             : Payment methods
- DIM_STORE               : Store master data
- DIM_TEMPERATURE         : Temperature categories
- DIM_CATEGORY            : Product categories

AGGREGATED VIEWS (Pre-calculated):
- REVENUE_BY_MONTH        : Monthly revenue summary
- REVENUE_BY_CATEGORY     : Category performance
- SALES_BY_TEMPERATURE    : Temperature impact analysis
- HOLIDAY_IMPACT          : Holiday vs Non-holiday comparison
- STORE_RANKING           : Store performance ranking
- CUSTOMER_DEMOGRAPHICS   : Customer segmentation
- PAYMENT_METHODS         : Payment method analysis
"""

print("✅ Data loaded successfully!")
print(f"📊 FACT_SALES: {len(FACT_SALES):,} rows")
print(f"📊 FACT_STORE_PERFORMANCE: {len(FACT_STORE_PERFORMANCE):,} rows")
print(f"📊 FACT_PRODUCT_CATALOG: {len(FACT_PRODUCT_CATALOG):,} rows")
