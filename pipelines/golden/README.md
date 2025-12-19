# Golden Layer - Star Schema

This folder builds the business-ready star schema for analytics. Running the pipeline produces **6 tables**: 5 dimensions and 1 fact.

## Tables
- `DIM_PRODUCT` (product_key, product_name, brand, category fields)
- `DIM_CUSTOMER` (customer_key, demographics)
- `DIM_DATE` (date_key with calendar attributes)
- `DIM_PAYMENT` (payment_key)
- `DIM_CATEGORY` (category_key, root_category_name)
- `FACT_SALES` (transaction_id with FKs to all dimensions and measures: purchase_amount, discount_applied, rating, repeat_customer)

## Run
```bash
python pipelines/golden/run_pipeline.py
```

Outputs are written under `data/Golden`:
- `data/Golden/standardized/` – harmonized source files + `product_master.csv`
- `data/Golden/dimensions/` – dimension tables
- `data/Golden/facts/` – fact tables
- DuckDB warehouse updated at `database/walmart_analytics.db` with DIM_/FACT_ tables

## Validation
```bash
python pipelines/golden/validate_schema.py
```
Validates primary keys and FK relationships for `FACT_SALES`.

## PYTHON SCRIPT
import duckdb
import pandas as pd

DB_PATH = r"D:\DA_pipeline\DA\database\walmart_analytics.db"
conn = duckdb.connect(DB_PATH, read_only=True)

# STAR SCHEMA 1: FACT_SALES
FACT_SALES = conn.execute("""
    SELECT fs.*, 
           dc.customer_id, dc.gender, dc.age, dc.age_group, dc.city,
           dp.product_name, dp.category_name,
           dd.full_date, dd.year, dd.month, dd.month_name, dd.quarter, dd.is_weekend,
           dpm.payment_method
    FROM fact_sales fs
    LEFT JOIN dim_customer dc ON fs.customer_key = dc.customer_key
    LEFT JOIN dim_product dp ON fs.product_key = dp.product_key
    LEFT JOIN dim_date dd ON fs.date_key = dd.date_key
    LEFT JOIN dim_payment dpm ON fs.payment_key = dpm.payment_key
""").df()

# STAR SCHEMA 2: FACT_STORE_PERFORMANCE
FACT_STORE_PERFORMANCE = conn.execute("""
    SELECT fsp.*, 
           ds.store_id, ds.store_name, ds.region,
           dd.full_date, dd.year, dd.month, dd.month_name,
           dt.temp_category
    FROM fact_store_performance fsp
    LEFT JOIN dim_store ds ON fsp.store_key = ds.store_key
    LEFT JOIN dim_date_store dd ON fsp.date_key = dd.date_key
    LEFT JOIN dim_temperature dt ON fsp.temp_category_key = dt.temp_category_key
""").df()

# STAR SCHEMA 3: FACT_ECOMMERCE_SALES
FACT_ECOMMERCE = conn.execute("""
    SELECT * FROM fact_ecommerce_sales
""").df()

conn.close()