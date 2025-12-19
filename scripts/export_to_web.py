"""
Export DuckDB Data to JSON for React Dashboard
===============================================
Runs after pipeline to generate fresh JSON data files
that the React app can import directly.

Usage:
    python export_to_web.py
    
Output:
    WEB/src/data/retail_sales.json
    WEB/src/data/store_performance.json  
    WEB/src/data/ecommerce.json
"""

import json
from pathlib import Path
from datetime import datetime
import duckdb

# Paths
BASE_DIR = Path(__file__).resolve().parents[1]
DB_PATH = BASE_DIR / "database" / "walmart_analytics.db"
OUTPUT_DIR = BASE_DIR / "WEB" / "src" / "data"


def get_connection():
    """Get DuckDB connection"""
    if not DB_PATH.exists():
        raise FileNotFoundError(f"Database not found: {DB_PATH}")
    return duckdb.connect(str(DB_PATH), read_only=True)


def export_retail_sales():
    """Export Star Schema 1: Retail Sales data"""
    print("📊 Exporting Retail Sales data...")
    
    with get_connection() as conn:
        # KPIs
        kpis = conn.execute("""
            SELECT 
                ROUND(SUM(purchase_amount), 2) as total_revenue,
                COUNT(*) as total_orders,
                ROUND(AVG(purchase_amount), 2) as avg_order_value,
                ROUND(AVG(rating), 3) as avg_rating,
                COUNT(DISTINCT customer_key) as unique_customers
            FROM fact_sales
        """).fetchone()
        
        # Revenue by Month
        revenue_by_month = conn.execute("""
            SELECT 
                d.month,
                d.month_name,
                ROUND(SUM(f.purchase_amount), 2) as revenue,
                COUNT(*) as orders
            FROM fact_sales f
            JOIN dim_date d ON f.date_key = d.date_key
            GROUP BY d.month, d.month_name
            ORDER BY d.month
        """).fetchall()
        
        month_abbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        # Revenue by Category
        revenue_by_category = conn.execute("""
            SELECT 
                c.root_category_name as category,
                ROUND(SUM(f.purchase_amount), 2) as revenue,
                COUNT(*) as orders,
                ROUND(AVG(f.rating), 3) as avg_rating
            FROM fact_sales f
            JOIN dim_category c ON f.category_key = c.category_key
            GROUP BY c.root_category_name
            ORDER BY revenue DESC
        """).fetchall()
        
        colors = ['#0071CE', '#00A3E0', '#FFC220', '#78BE20']
        
        # Revenue by Payment
        total_revenue = kpis[0]
        revenue_by_payment = conn.execute("""
            SELECT 
                p.payment_method,
                ROUND(SUM(f.purchase_amount), 2) as revenue,
                COUNT(*) as orders
            FROM fact_sales f
            JOIN dim_payment p ON f.payment_key = p.payment_key
            GROUP BY p.payment_method
            ORDER BY revenue DESC
        """).fetchall()
        
        # Customer Demographics - Age Groups
        age_groups = conn.execute("""
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
        
        total_customers = sum(r[1] for r in age_groups)
        
        # Gender Distribution
        gender_split = conn.execute("""
            SELECT gender, COUNT(*) as count
            FROM dim_customer
            GROUP BY gender
            ORDER BY count DESC
        """).fetchall()
        
        # Rating Distribution
        rating_dist = conn.execute("""
            SELECT 
                CAST(rating AS INT) as rating_val,
                COUNT(*) as count
            FROM fact_sales
            WHERE rating IS NOT NULL
            GROUP BY CAST(rating AS INT)
            ORDER BY rating_val
        """).fetchall()
        
        total_ratings = sum(r[1] for r in rating_dist)
        
        # Top Cities
        top_cities = conn.execute("""
            SELECT 
                c.city,
                ROUND(SUM(f.purchase_amount), 2) as revenue,
                COUNT(*) as orders
            FROM fact_sales f
            JOIN dim_customer c ON f.customer_key = c.customer_key
            GROUP BY c.city
            ORDER BY revenue DESC
            LIMIT 10
        """).fetchall()
        
    data = {
        "generatedAt": datetime.now().isoformat(),
        "source": "DuckDB walmart_analytics.db",
        
        "totalRevenue": kpis[0],
        "totalOrders": kpis[1],
        "avgOrderValue": kpis[2],
        "avgRating": kpis[3],
        "uniqueCustomers": kpis[4],
        
        "revenueByMonth": [
            {
                "month": month_abbr[r[0] - 1],
                "monthName": r[1],
                "revenue": r[2],
                "orders": r[3]
            }
            for r in revenue_by_month
        ],
        
        "revenueByCategory": [
            {
                "category": r[0],
                "revenue": r[1],
                "orders": r[2],
                "avgRating": r[3],
                "color": colors[i % len(colors)]
            }
            for i, r in enumerate(revenue_by_category)
        ],
        
        "revenueByPayment": [
            {
                "method": r[0],
                "revenue": r[1],
                "orders": r[2],
                "percentage": round(r[1] / total_revenue * 100, 1) if total_revenue else 0
            }
            for r in revenue_by_payment
        ],
        
        "paymentMethods": [
            {"method": r[0], "revenue": r[1], "orders": r[2]}
            for r in revenue_by_payment
        ],
        
        "customerDemographics": {
            "ageGroups": [
                {
                    "ageGroup": r[0],
                    "count": r[1],
                    "percentage": round(r[1] / total_customers * 100, 1)
                }
                for r in age_groups
            ],
            "genderSplit": [
                {
                    "gender": r[0],
                    "count": r[1],
                    "percentage": round(r[1] / total_customers * 100, 1)
                }
                for r in gender_split
            ]
        },
        
        "customerByAgeGroup": [
            {
                "ageGroup": r[0],
                "count": r[1],
                "percentage": round(r[1] / total_customers * 100, 1)
            }
            for r in age_groups
        ],
        
        "customerByGender": [
            {
                "gender": r[0],
                "count": r[1],
                "percentage": round(r[1] / total_customers * 100, 1)
            }
            for r in gender_split
        ],
        
        "categoryPerformance": [
            {
                "category": r[0],
                "revenue": r[1],
                "orders": r[2],
                "avgRating": r[3]
            }
            for r in revenue_by_category
        ],
        
        "ratingDistribution": [
            {
                "rating": r[0],
                "count": r[1],
                "percentage": round(r[1] / total_ratings * 100, 1)
            }
            for r in rating_dist
        ],
        
        "topCities": [
            {"city": r[0], "revenue": r[1], "orders": r[2]}
            for r in top_cities
        ]
    }
    
    return data


def export_store_performance():
    """Export Star Schema 2: Store Performance data"""
    print("🏪 Exporting Store Performance data...")
    
    with get_connection() as conn:
        # KPIs
        kpis = conn.execute("""
            SELECT 
                ROUND(SUM(weekly_sales), 2) as total_sales,
                COUNT(*) as total_records,
                ROUND(AVG(weekly_sales), 2) as avg_weekly_sales,
                COUNT(DISTINCT store_key) as total_stores,
                ROUND(AVG(temperature), 1) as avg_temp,
                ROUND(AVG(fuel_price), 3) as avg_fuel,
                ROUND(AVG(cpi), 2) as avg_cpi,
                ROUND(AVG(unemployment), 2) as avg_unemployment
            FROM fact_store_performance
        """).fetchone()
        
        # Sales by Store (Top 10)
        sales_by_store = conn.execute("""
            SELECT 
                s.store_name,
                s.region,
                ROUND(SUM(f.weekly_sales), 2) as total_sales,
                ROUND(AVG(f.weekly_sales), 2) as avg_sales
            FROM fact_store_performance f
            JOIN dim_store s ON f.store_key = s.store_key
            GROUP BY s.store_key, s.store_name, s.region
            ORDER BY total_sales DESC
            LIMIT 15
        """).fetchall()
        
        # Sales by Year
        sales_by_year = conn.execute("""
            SELECT 
                d.year,
                ROUND(SUM(f.weekly_sales), 2) as total_sales,
                ROUND(AVG(f.weekly_sales), 2) as avg_sales,
                COUNT(*) as weeks
            FROM fact_store_performance f
            JOIN dim_date_store d ON f.date_key = d.date_key
            GROUP BY d.year
            ORDER BY d.year
        """).fetchall()
        
        # Sales by Month (aggregated across years)
        sales_by_month = conn.execute("""
            SELECT 
                d.month,
                d.month_name,
                ROUND(SUM(f.weekly_sales), 2) as total_sales,
                ROUND(AVG(f.weekly_sales), 2) as avg_sales
            FROM fact_store_performance f
            JOIN dim_date_store d ON f.date_key = d.date_key
            GROUP BY d.month, d.month_name
            ORDER BY d.month
        """).fetchall()
        
        month_abbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        # Temperature Impact
        temp_impact = conn.execute("""
            SELECT 
                t.temp_category,
                ROUND(AVG(f.weekly_sales), 2) as avg_sales,
                COUNT(*) as count
            FROM fact_store_performance f
            JOIN dim_temperature t ON f.temp_category_key = t.temp_category_key
            GROUP BY t.temp_category_key, t.temp_category
            ORDER BY avg_sales DESC
        """).fetchall()
        
        # Holiday Impact
        holiday_impact = conn.execute("""
            SELECT 
                CASE WHEN holiday_flag = 1 THEN 'Holiday' ELSE 'Non-Holiday' END as period,
                ROUND(SUM(weekly_sales), 2) as total_sales,
                ROUND(AVG(weekly_sales), 2) as avg_sales,
                COUNT(*) as weeks
            FROM fact_store_performance
            GROUP BY holiday_flag
        """).fetchall()
        
        # Economic Correlation Data
        economic_data = conn.execute("""
            SELECT 
                d.year,
                d.month,
                ROUND(AVG(f.weekly_sales), 2) as avg_sales,
                ROUND(AVG(f.fuel_price), 3) as avg_fuel,
                ROUND(AVG(f.cpi), 2) as avg_cpi,
                ROUND(AVG(f.unemployment), 2) as avg_unemployment
            FROM fact_store_performance f
            JOIN dim_date_store d ON f.date_key = d.date_key
            GROUP BY d.year, d.month
            ORDER BY d.year, d.month
        """).fetchall()
        
    data = {
        "generatedAt": datetime.now().isoformat(),
        "source": "DuckDB walmart_analytics.db",
        
        "totalWeeklySales": kpis[0],
        "totalRecords": kpis[1],
        "avgWeeklySales": kpis[2],
        "totalStores": kpis[3],
        "avgTemperature": kpis[4],
        "avgFuelPrice": kpis[5],
        "avgCPI": kpis[6],
        "avgUnemployment": kpis[7],
        
        "salesByStore": [
            {
                "store": r[0],
                "region": r[1],
                "totalSales": r[2],
                "avgSales": r[3]
            }
            for r in sales_by_store
        ],
        
        "salesByYear": [
            {
                "year": r[0],
                "totalSales": r[1],
                "avgSales": r[2],
                "weeks": r[3]
            }
            for r in sales_by_year
        ],
        
        "salesByMonth": [
            {
                "month": month_abbr[r[0] - 1],
                "monthName": r[1],
                "totalSales": r[2],
                "avgSales": r[3]
            }
            for r in sales_by_month
        ],
        
        "temperatureImpact": [
            {
                "tempCategory": r[0],
                "avgSales": r[1],
                "count": r[2]
            }
            for r in temp_impact
        ],
        
        "holidayImpact": [
            {
                "period": r[0],
                "totalSales": r[1],
                "avgSales": r[2],
                "weeks": r[3]
            }
            for r in holiday_impact
        ],
        
        "economicTrend": [
            {
                "year": r[0],
                "month": r[1],
                "avgSales": r[2],
                "avgFuelPrice": r[3],
                "avgCPI": r[4],
                "avgUnemployment": r[5]
            }
            for r in economic_data
        ]
    }
    
    return data


def export_ecommerce():
    """Export Star Schema 3: E-commerce data"""
    print("🛒 Exporting E-commerce data...")
    
    with get_connection() as conn:
        # KPIs
        kpis = conn.execute("""
            SELECT 
                COUNT(*) as total_products,
                ROUND(AVG(list_price), 2) as avg_list_price,
                ROUND(AVG(sale_price), 2) as avg_sale_price,
                ROUND(AVG(discount_pct), 1) as avg_discount_pct,
                SUM(CASE WHEN available_flag = 1 THEN 1 ELSE 0 END) as available,
                COUNT(DISTINCT brand_key) as total_brands,
                COUNT(DISTINCT ecommerce_category_key) as total_categories
            FROM fact_ecommerce_sales
        """).fetchone()
        
        # Products by Category
        by_category = conn.execute("""
            SELECT 
                c.root_category,
                COUNT(*) as product_count,
                ROUND(AVG(f.list_price), 2) as avg_list_price,
                ROUND(AVG(f.sale_price), 2) as avg_sale_price,
                ROUND(AVG(f.discount_pct), 1) as avg_discount
            FROM fact_ecommerce_sales f
            JOIN dim_ecommerce_category c ON f.ecommerce_category_key = c.ecommerce_category_key
            GROUP BY c.root_category
            ORDER BY product_count DESC
        """).fetchall()
        
        colors = ['#0071CE', '#00A3E0', '#FFC220', '#78BE20', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
        
        # Top Brands
        top_brands = conn.execute("""
            SELECT 
                b.brand,
                COUNT(*) as product_count,
                ROUND(AVG(f.list_price), 2) as avg_price,
                ROUND(AVG(f.discount_pct), 1) as avg_discount
            FROM fact_ecommerce_sales f
            JOIN dim_ecommerce_brand b ON f.brand_key = b.brand_key
            WHERE b.brand != '0' AND b.brand IS NOT NULL AND LENGTH(b.brand) > 1
            GROUP BY b.brand
            ORDER BY product_count DESC
            LIMIT 15
        """).fetchall()
        
        # Price Distribution
        price_dist = conn.execute("""
            SELECT 
                CASE 
                    WHEN sale_price < 10 THEN '$0-10'
                    WHEN sale_price < 25 THEN '$10-25'
                    WHEN sale_price < 50 THEN '$25-50'
                    WHEN sale_price < 100 THEN '$50-100'
                    WHEN sale_price < 200 THEN '$100-200'
                    ELSE '$200+'
                END as price_range,
                COUNT(*) as count,
                ROUND(AVG(discount_pct), 1) as avg_discount
            FROM fact_ecommerce_sales
            GROUP BY 
                CASE 
                    WHEN sale_price < 10 THEN 1
                    WHEN sale_price < 25 THEN 2
                    WHEN sale_price < 50 THEN 3
                    WHEN sale_price < 100 THEN 4
                    WHEN sale_price < 200 THEN 5
                    ELSE 6
                END,
                CASE 
                    WHEN sale_price < 10 THEN '$0-10'
                    WHEN sale_price < 25 THEN '$10-25'
                    WHEN sale_price < 50 THEN '$25-50'
                    WHEN sale_price < 100 THEN '$50-100'
                    WHEN sale_price < 200 THEN '$100-200'
                    ELSE '$200+'
                END
            ORDER BY 1
        """).fetchall()
        
        # Discount Distribution
        discount_dist = conn.execute("""
            SELECT 
                CASE 
                    WHEN discount_pct = 0 THEN 'No Discount'
                    WHEN discount_pct < 10 THEN '1-10%'
                    WHEN discount_pct < 25 THEN '10-25%'
                    WHEN discount_pct < 50 THEN '25-50%'
                    ELSE '50%+'
                END as discount_range,
                COUNT(*) as count
            FROM fact_ecommerce_sales
            GROUP BY 
                CASE 
                    WHEN discount_pct = 0 THEN 0
                    WHEN discount_pct < 10 THEN 1
                    WHEN discount_pct < 25 THEN 2
                    WHEN discount_pct < 50 THEN 3
                    ELSE 4
                END,
                CASE 
                    WHEN discount_pct = 0 THEN 'No Discount'
                    WHEN discount_pct < 10 THEN '1-10%'
                    WHEN discount_pct < 25 THEN '10-25%'
                    WHEN discount_pct < 50 THEN '25-50%'
                    ELSE '50%+'
                END
            ORDER BY 1
        """).fetchall()
        
        # Availability by Category
        availability = conn.execute("""
            SELECT 
                c.root_category,
                SUM(CASE WHEN f.available_flag = 1 THEN 1 ELSE 0 END) as available,
                SUM(CASE WHEN f.available_flag = 0 THEN 1 ELSE 0 END) as unavailable,
                COUNT(*) as total
            FROM fact_ecommerce_sales f
            JOIN dim_ecommerce_category c ON f.ecommerce_category_key = c.ecommerce_category_key
            GROUP BY c.root_category
            ORDER BY total DESC
        """).fetchall()
        
    total_products = kpis[0]
    
    data = {
        "generatedAt": datetime.now().isoformat(),
        "source": "DuckDB walmart_analytics.db",
        
        "totalProducts": kpis[0],
        "avgListPrice": kpis[1],
        "avgSalePrice": kpis[2],
        "avgDiscountPct": kpis[3],
        "availableProducts": kpis[4],
        "totalBrands": kpis[5],
        "totalCategories": kpis[6],
        
        "productsByCategory": [
            {
                "category": r[0],
                "productCount": r[1],
                "avgListPrice": r[2],
                "avgSalePrice": r[3],
                "avgDiscount": r[4],
                "color": colors[i % len(colors)]
            }
            for i, r in enumerate(by_category)
        ],
        
        "topBrands": [
            {
                "brand": r[0],
                "productCount": r[1],
                "avgPrice": r[2],
                "avgDiscount": r[3]
            }
            for r in top_brands
        ],
        
        "priceDistribution": [
            {
                "priceRange": r[0],
                "count": r[1],
                "avgDiscount": r[2],
                "percentage": round(r[1] / total_products * 100, 1)
            }
            for r in price_dist
        ],
        
        "discountDistribution": [
            {
                "discountRange": r[0],
                "count": r[1],
                "percentage": round(r[1] / total_products * 100, 1)
            }
            for r in discount_dist
        ],
        
        "availabilityByCategory": [
            {
                "category": r[0],
                "available": r[1],
                "unavailable": r[2],
                "total": r[3],
                "availabilityRate": round(r[1] / r[3] * 100, 1) if r[3] > 0 else 0
            }
            for r in availability
        ]
    }
    
    return data


def main():
    """Export all data"""
    print("=" * 60)
    print("🚀 EXPORTING DUCKDB DATA TO WEB JSON FILES")
    print("=" * 60)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Export each schema
    retail_data = export_retail_sales()
    with open(OUTPUT_DIR / "retail_sales.json", "w", encoding="utf-8") as f:
        json.dump(retail_data, f, indent=2, ensure_ascii=False)
    print(f"   ✅ Saved retail_sales.json")
    
    store_data = export_store_performance()
    with open(OUTPUT_DIR / "store_performance.json", "w", encoding="utf-8") as f:
        json.dump(store_data, f, indent=2, ensure_ascii=False)
    print(f"   ✅ Saved store_performance.json")
    
    ecommerce_data = export_ecommerce()
    with open(OUTPUT_DIR / "ecommerce.json", "w", encoding="utf-8") as f:
        json.dump(ecommerce_data, f, indent=2, ensure_ascii=False)
    print(f"   ✅ Saved ecommerce.json")
    
    print("=" * 60)
    print("✅ ALL DATA EXPORTED SUCCESSFULLY!")
    print(f"   Output: {OUTPUT_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
