"""
Walmart Analytics API Server
============================
FastAPI backend serving data from DuckDB for the React dashboard.
Replaces hardcoded mock data with real-time queries.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import Optional
import duckdb

app = FastAPI(
    title="Walmart Analytics API",
    description="API for Walmart Galaxy Schema Data",
    version="1.0.0"
)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database path
BASE_DIR = Path(__file__).resolve().parents[2]
DB_PATH = BASE_DIR / "database" / "walmart_analytics.db"


def get_connection():
    """Get DuckDB connection"""
    if not DB_PATH.exists():
        raise HTTPException(status_code=500, detail=f"Database not found: {DB_PATH}")
    return duckdb.connect(str(DB_PATH), read_only=True)


# ============================================================
# STAR SCHEMA 1: RETAIL SALES ENDPOINTS
# ============================================================

@app.get("/api/retail/kpis")
def get_retail_kpis():
    """Get main KPIs for Retail Sales dashboard"""
    with get_connection() as conn:
        result = conn.execute("""
            SELECT 
                SUM(purchase_amount) as total_revenue,
                COUNT(*) as total_orders,
                AVG(purchase_amount) as avg_order_value,
                AVG(rating) as avg_rating,
                COUNT(DISTINCT customer_key) as unique_customers
            FROM fact_sales
        """).fetchone()
        
        return {
            "totalRevenue": round(result[0], 2),
            "totalOrders": result[1],
            "avgOrderValue": round(result[2], 2),
            "avgRating": round(result[3], 3),
            "uniqueCustomers": result[4]
        }


@app.get("/api/retail/revenue-by-month")
def get_revenue_by_month():
    """Get revenue aggregated by month"""
    with get_connection() as conn:
        results = conn.execute("""
            SELECT 
                d.month,
                d.month_name,
                SUM(f.purchase_amount) as revenue,
                COUNT(*) as orders
            FROM fact_sales f
            JOIN dim_date d ON f.date_key = d.date_key
            GROUP BY d.month, d.month_name
            ORDER BY d.month
        """).fetchall()
        
        month_abbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        return [
            {
                "month": month_abbr[r[0] - 1],
                "monthName": r[1],
                "revenue": round(r[2], 2),
                "orders": r[3]
            }
            for r in results
        ]


@app.get("/api/retail/revenue-by-category")
def get_revenue_by_category():
    """Get revenue by product category"""
    colors = ['#0071CE', '#00A3E0', '#FFC220', '#78BE20']
    
    with get_connection() as conn:
        results = conn.execute("""
            SELECT 
                c.root_category_name as category,
                SUM(f.purchase_amount) as revenue,
                COUNT(*) as orders,
                AVG(f.rating) as avg_rating
            FROM fact_sales f
            JOIN dim_category c ON f.category_key = c.category_key
            GROUP BY c.root_category_name
            ORDER BY revenue DESC
        """).fetchall()
        
        return [
            {
                "category": r[0],
                "revenue": round(r[1], 2),
                "orders": r[2],
                "avgRating": round(r[3], 3),
                "color": colors[i % len(colors)]
            }
            for i, r in enumerate(results)
        ]


@app.get("/api/retail/revenue-by-payment")
def get_revenue_by_payment():
    """Get revenue by payment method"""
    with get_connection() as conn:
        total = conn.execute("SELECT SUM(purchase_amount) FROM fact_sales").fetchone()[0]
        
        results = conn.execute("""
            SELECT 
                p.payment_method,
                SUM(f.purchase_amount) as revenue,
                COUNT(*) as orders
            FROM fact_sales f
            JOIN dim_payment p ON f.payment_key = p.payment_key
            GROUP BY p.payment_method
            ORDER BY revenue DESC
        """).fetchall()
        
        return [
            {
                "method": r[0],
                "revenue": round(r[1], 2),
                "orders": r[2],
                "percentage": round(r[1] / total * 100, 1)
            }
            for r in results
        ]


@app.get("/api/retail/customers/demographics")
def get_customer_demographics():
    """Get customer demographics (age groups, gender)"""
    with get_connection() as conn:
        # Age groups
        age_results = conn.execute("""
            SELECT 
                age_group,
                COUNT(*) as count
            FROM dim_customer
            GROUP BY age_group
            ORDER BY 
                CASE age_group 
                    WHEN '<18' THEN 1 
                    WHEN '18-30' THEN 2 
                    WHEN '31-45' THEN 3 
                    WHEN '46-60' THEN 4 
                    ELSE 5 
                END
        """).fetchall()
        
        total_age = sum(r[1] for r in age_results)
        
        # Gender
        gender_results = conn.execute("""
            SELECT 
                gender,
                COUNT(*) as count
            FROM dim_customer
            GROUP BY gender
            ORDER BY count DESC
        """).fetchall()
        
        total_gender = sum(r[1] for r in gender_results)
        
        return {
            "ageGroups": [
                {"ageGroup": r[0], "count": r[1], "percentage": round(r[1] / total_age * 100, 1)}
                for r in age_results
            ],
            "genderSplit": [
                {"gender": r[0], "count": r[1], "percentage": round(r[1] / total_gender * 100, 1)}
                for r in gender_results
            ]
        }


# ============================================================
# STAR SCHEMA 2: STORE PERFORMANCE ENDPOINTS
# ============================================================

@app.get("/api/store/kpis")
def get_store_kpis():
    """Get Store Performance KPIs"""
    with get_connection() as conn:
        result = conn.execute("""
            SELECT 
                SUM(weekly_sales) as total_sales,
                COUNT(*) as total_records,
                AVG(weekly_sales) as avg_weekly_sales,
                COUNT(DISTINCT store_key) as total_stores,
                AVG(temperature) as avg_temp,
                AVG(fuel_price) as avg_fuel,
                AVG(cpi) as avg_cpi,
                AVG(unemployment) as avg_unemployment
            FROM fact_store_performance
        """).fetchone()
        
        return {
            "totalSales": round(result[0], 2),
            "totalRecords": result[1],
            "avgWeeklySales": round(result[2], 2),
            "totalStores": result[3],
            "avgTemperature": round(result[4], 1),
            "avgFuelPrice": round(result[5], 3),
            "avgCPI": round(result[6], 2),
            "avgUnemployment": round(result[7], 2)
        }


@app.get("/api/store/sales-by-store")
def get_sales_by_store(limit: int = 10):
    """Get sales by store"""
    with get_connection() as conn:
        results = conn.execute(f"""
            SELECT 
                s.store_name,
                s.region,
                SUM(f.weekly_sales) as total_sales,
                AVG(f.weekly_sales) as avg_sales,
                COUNT(*) as weeks
            FROM fact_store_performance f
            JOIN dim_store s ON f.store_key = s.store_key
            GROUP BY s.store_key, s.store_name, s.region
            ORDER BY total_sales DESC
            LIMIT {limit}
        """).fetchall()
        
        return [
            {
                "store": r[0],
                "region": r[1],
                "totalSales": round(r[2], 2),
                "avgSales": round(r[3], 2),
                "weeks": r[4]
            }
            for r in results
        ]


@app.get("/api/store/sales-by-year")
def get_store_sales_by_year():
    """Get store sales trend by year"""
    with get_connection() as conn:
        results = conn.execute("""
            SELECT 
                d.year,
                SUM(f.weekly_sales) as total_sales,
                AVG(f.weekly_sales) as avg_sales,
                COUNT(*) as records
            FROM fact_store_performance f
            JOIN dim_date_store d ON f.date_key = d.date_key
            GROUP BY d.year
            ORDER BY d.year
        """).fetchall()
        
        return [
            {
                "year": r[0],
                "totalSales": round(r[1], 2),
                "avgSales": round(r[2], 2),
                "records": r[3]
            }
            for r in results
        ]


@app.get("/api/store/economic-impact")
def get_economic_impact():
    """Get economic indicators correlation with sales"""
    with get_connection() as conn:
        results = conn.execute("""
            SELECT 
                t.temp_category,
                AVG(f.weekly_sales) as avg_sales,
                AVG(f.fuel_price) as avg_fuel,
                AVG(f.cpi) as avg_cpi,
                AVG(f.unemployment) as avg_unemployment,
                COUNT(*) as count
            FROM fact_store_performance f
            JOIN dim_temperature t ON f.temp_category_key = t.temp_category_key
            GROUP BY t.temp_category
            ORDER BY avg_sales DESC
        """).fetchall()
        
        return [
            {
                "tempCategory": r[0],
                "avgSales": round(r[1], 2),
                "avgFuelPrice": round(r[2], 3),
                "avgCPI": round(r[3], 2),
                "avgUnemployment": round(r[4], 2),
                "count": r[5]
            }
            for r in results
        ]


@app.get("/api/store/holiday-impact")
def get_holiday_impact():
    """Get holiday vs non-holiday sales comparison"""
    with get_connection() as conn:
        results = conn.execute("""
            SELECT 
                CASE WHEN holiday_flag = 1 THEN 'Holiday' ELSE 'Non-Holiday' END as period,
                SUM(weekly_sales) as total_sales,
                AVG(weekly_sales) as avg_sales,
                COUNT(*) as weeks
            FROM fact_store_performance
            GROUP BY holiday_flag
        """).fetchall()
        
        return [
            {
                "period": r[0],
                "totalSales": round(r[1], 2),
                "avgSales": round(r[2], 2),
                "weeks": r[3]
            }
            for r in results
        ]


# ============================================================
# STAR SCHEMA 3: E-COMMERCE ENDPOINTS
# ============================================================

@app.get("/api/ecommerce/kpis")
def get_ecommerce_kpis():
    """Get E-commerce KPIs"""
    with get_connection() as conn:
        result = conn.execute("""
            SELECT 
                COUNT(*) as total_products,
                AVG(list_price) as avg_list_price,
                AVG(sale_price) as avg_sale_price,
                AVG(discount_pct) as avg_discount_pct,
                SUM(CASE WHEN available_flag = 1 THEN 1 ELSE 0 END) as available_products,
                COUNT(DISTINCT brand_key) as total_brands,
                COUNT(DISTINCT ecommerce_category_key) as total_categories
            FROM fact_ecommerce_sales
        """).fetchone()
        
        return {
            "totalProducts": result[0],
            "avgListPrice": round(result[1], 2),
            "avgSalePrice": round(result[2], 2),
            "avgDiscountPct": round(result[3], 1),
            "availableProducts": result[4],
            "totalBrands": result[5],
            "totalCategories": result[6]
        }


@app.get("/api/ecommerce/products-by-category")
def get_products_by_category():
    """Get product distribution by category"""
    with get_connection() as conn:
        results = conn.execute("""
            SELECT 
                c.root_category,
                COUNT(*) as product_count,
                AVG(f.list_price) as avg_list_price,
                AVG(f.sale_price) as avg_sale_price,
                AVG(f.discount_pct) as avg_discount
            FROM fact_ecommerce_sales f
            JOIN dim_ecommerce_category c ON f.ecommerce_category_key = c.ecommerce_category_key
            GROUP BY c.root_category
            ORDER BY product_count DESC
        """).fetchall()
        
        return [
            {
                "category": r[0],
                "productCount": r[1],
                "avgListPrice": round(r[2], 2),
                "avgSalePrice": round(r[3], 2),
                "avgDiscount": round(r[4], 1)
            }
            for r in results
        ]


@app.get("/api/ecommerce/top-brands")
def get_top_brands(limit: int = 10):
    """Get top brands by product count"""
    with get_connection() as conn:
        results = conn.execute(f"""
            SELECT 
                b.brand,
                COUNT(*) as product_count,
                AVG(f.list_price) as avg_price,
                AVG(f.discount_pct) as avg_discount
            FROM fact_ecommerce_sales f
            JOIN dim_ecommerce_brand b ON f.brand_key = b.brand_key
            WHERE b.brand != '0' AND b.brand IS NOT NULL
            GROUP BY b.brand
            ORDER BY product_count DESC
            LIMIT {limit}
        """).fetchall()
        
        return [
            {
                "brand": r[0],
                "productCount": r[1],
                "avgPrice": round(r[2], 2),
                "avgDiscount": round(r[3], 1)
            }
            for r in results
        ]


@app.get("/api/ecommerce/price-distribution")
def get_price_distribution():
    """Get price range distribution"""
    with get_connection() as conn:
        results = conn.execute("""
            SELECT 
                CASE 
                    WHEN sale_price < 10 THEN '$0-10'
                    WHEN sale_price < 25 THEN '$10-25'
                    WHEN sale_price < 50 THEN '$25-50'
                    WHEN sale_price < 100 THEN '$50-100'
                    WHEN sale_price < 200 THEN '$100-200'
                    ELSE '$200+'
                END as price_range,
                COUNT(*) as count
            FROM fact_ecommerce_sales
            GROUP BY 
                CASE 
                    WHEN sale_price < 10 THEN '$0-10'
                    WHEN sale_price < 25 THEN '$10-25'
                    WHEN sale_price < 50 THEN '$25-50'
                    WHEN sale_price < 100 THEN '$50-100'
                    WHEN sale_price < 200 THEN '$100-200'
                    ELSE '$200+'
                END
            ORDER BY MIN(sale_price)
        """).fetchall()
        
        return [{"priceRange": r[0], "count": r[1]} for r in results]


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check():
    """API health check"""
    try:
        with get_connection() as conn:
            conn.execute("SELECT 1").fetchone()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/schema-info")
def get_schema_info():
    """Get information about all tables in the database"""
    with get_connection() as conn:
        tables = conn.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'main'
        """).fetchall()
        
        info = {}
        for (table_name,) in tables:
            count = conn.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]
            info[table_name] = {"row_count": count}
        
        return info


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
