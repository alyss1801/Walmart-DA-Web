"""
Power BI - Revenue Trend Analysis Dashboard
===========================================
Script riêng cho dashboard Revenue Trend Analysis

CÁCH SỬ DỤNG:
1. Power BI Desktop → Get Data → Python script
2. Paste code này
3. Chọn các tables cần thiết
"""

import duckdb
import pandas as pd

# Đường dẫn database - THAY ĐỔI NẾU CẦN
DB_PATH = r"D:\DA_pipeline\DA\database\walmart_analytics.db"

conn = duckdb.connect(DB_PATH, read_only=True)

# ============================================================
# 1. MONTHLY REVENUE & ORDERS (cho combo chart)
# ============================================================
Monthly_Revenue_Orders = conn.execute("""
    SELECT 
        dd.month,
        dd.month_name,
        SUM(fs.purchase_amount) as total_revenue,
        COUNT(*) as total_orders,
        AVG(fs.purchase_amount) as avg_order_value
    FROM FACT_SALES fs
    JOIN DIM_DATE dd ON fs.date_key = dd.date_key
    GROUP BY dd.month, dd.month_name
    ORDER BY dd.month
""").df()

# ============================================================
# 2. TEMPERATURE IMPACT (cho bar chart)
# ============================================================
Temperature_Impact = conn.execute("""
    SELECT 
        dt.temp_category,
        AVG(fsp.weekly_sales) as avg_weekly_sales,
        COUNT(*) as week_count
    FROM FACT_STORE_PERFORMANCE fsp
    JOIN DIM_TEMPERATURE dt ON fsp.temperature_key = dt.temperature_key
    GROUP BY dt.temp_category
""").df()

# ============================================================
# 3. HOLIDAY VS NON-HOLIDAY (cho donut chart)
# ============================================================
Holiday_Impact = conn.execute("""
    SELECT 
        CASE 
            WHEN holiday_flag = 1 THEN 'Holidays'
            ELSE 'Normal days'
        END as is_holiday,
        AVG(weekly_sales) as avg_weekly_sales,
        SUM(weekly_sales) as total_sales
    FROM FACT_STORE_PERFORMANCE
    GROUP BY holiday_flag
""").df()

# ============================================================
# 4. WEEKEND VS WEEKDAY (cho pie chart)
# ============================================================
Day_Type_Revenue = conn.execute("""
    SELECT 
        CASE 
            WHEN dd.is_weekend = 1 THEN 'Weekend'
            ELSE 'Weekday'
        END as day_type,
        SUM(fs.purchase_amount) as total_revenue,
        COUNT(*) as total_orders
    FROM FACT_SALES fs
    JOIN DIM_DATE dd ON fs.date_key = dd.date_key
    GROUP BY dd.is_weekend
""").df()

# ============================================================
# 5. CATEGORY REVENUE (cho bar chart)
# ============================================================
Category_Revenue = conn.execute("""
    SELECT 
        dp.category_name as category,
        SUM(fs.purchase_amount) as total_revenue,
        COUNT(*) as total_orders
    FROM FACT_SALES fs
    JOIN DIM_PRODUCT dp ON fs.product_key = dp.product_key
    GROUP BY dp.category_name
    ORDER BY total_revenue DESC
""").df()

# ============================================================
# 6. KPI METRICS
# ============================================================
KPI_Metrics = conn.execute("""
    SELECT 
        SUM(purchase_amount) as total_revenue,
        COUNT(*) as total_orders,
        AVG(purchase_amount) as avg_order_value,
        AVG(rating) as avg_rating,
        COUNT(DISTINCT customer_key) as unique_customers
    FROM FACT_SALES
""").df()

# ============================================================
# 7. FULL DATE TABLE (cho slicer)
# ============================================================
Date_Table = conn.execute("""
    SELECT DISTINCT
        dd.full_date,
        dd.year,
        dd.month,
        dd.month_name,
        dd.quarter,
        dd.day_name,
        dd.is_weekend
    FROM DIM_DATE dd
    ORDER BY dd.full_date
""").df()

# ============================================================
# 8. WEATHER CATEGORIES (cho slicer)
# ============================================================
Weather_Categories = conn.execute("""
    SELECT DISTINCT temp_category
    FROM DIM_TEMPERATURE
    ORDER BY temp_category
""").df()

conn.close()

print("✅ Revenue Trend Analysis data loaded!")
print(f"📈 Monthly_Revenue_Orders: {len(Monthly_Revenue_Orders)} months")
print(f"🌡️ Temperature_Impact: {len(Temperature_Impact)} categories")
print(f"📅 Holiday_Impact: {len(Holiday_Impact)} periods")
print(f"📊 Day_Type_Revenue: {len(Day_Type_Revenue)} types")
print(f"🏷️ Category_Revenue: {len(Category_Revenue)} categories")
