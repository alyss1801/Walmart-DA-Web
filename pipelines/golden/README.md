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
