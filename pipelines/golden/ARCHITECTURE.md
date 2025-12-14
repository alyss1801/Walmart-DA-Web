# Walmart Data Warehouse - GALAXY SCHEMA (3 Independent Star Schemas)

## Overview
**Galaxy Schema** với 3 Star Schema hoàn toàn độc lập cho 3 business process riêng biệt.

---

## Architecture Design

### ⭐ STAR SCHEMA 1: Retail Sales Analysis (2024-2025)

**Fact Table:**
- **FACT_SALES** (50,000 rows)
  - Grain: Transaction level
  - Time period: 2024-2025
  - Measures: purchase_amount, discount_applied, rating, repeat_customer
  - Foreign Keys:
    - date_key → DIM_DATE
    - customer_key → DIM_CUSTOMER
    - product_key → DIM_PRODUCT
    - payment_key → DIM_PAYMENT
    - category_key → DIM_CATEGORY

**Dimensions:**
1. **DIM_PRODUCT** (32,454 products) - Master từ 4 sources
2. **DIM_CUSTOMER** (50,000 customers) - Demographics
3. **DIM_DATE** (486 days) - Time dimension for retail
4. **DIM_PAYMENT** (4 methods) - Payment types
5. **DIM_CATEGORY** (439 categories) - Product categories

---

### ⭐ STAR SCHEMA 2: Store Performance Analysis (2010-2012)

**Fact Table:**
- **FACT_STORE_PERFORMANCE** (6,435 rows)
  - Grain: Weekly store-level
  - Time period: 2010-2012
  - Measures: weekly_sales, temperature, fuel_price, cpi, unemployment, holiday_flag
  - Foreign Keys:
    - date_key → DIM_DATE_STORE
    - store_key → DIM_STORE
    - temp_category_key → DIM_TEMPERATURE

**Dimensions:**
1. **DIM_STORE** (45 stores) - Store locations
2. **DIM_DATE_STORE** (1,066 days) - Time dimension for stores (2010-2012)
3. **DIM_TEMPERATURE** (5 categories) - Temperature classification

---

### ⭐ STAR SCHEMA 3: E-commerce Catalog Analysis (2019)

**Fact Table:**
- **FACT_ECOMMERCE_SALES** (30,170 rows)
  - Grain: Product level (catalog snapshot)
  - Time period: 2019 snapshot (NO time dimension)
  - Measures: list_price, sale_price, discount_amount, discount_pct, available_flag
  - Foreign Keys:
    - ecommerce_product_key → DIM_ECOMMERCE_PRODUCT
    - ecommerce_category_key → DIM_ECOMMERCE_CATEGORY
    - brand_key → DIM_ECOMMERCE_BRAND

**Dimensions:**
1. **DIM_ECOMMERCE_PRODUCT** (29,754 products) - E-commerce SKUs
2. **DIM_ECOMMERCE_CATEGORY** (312 categories) - Category hierarchy
3. **DIM_ECOMMERCE_BRAND** (10,746 brands) - Product brands

---

## Key Design Principles

### ✅ Complete Independence
- **No shared dimensions** between star schemas
- **No forced joins** between incompatible datasets
- **No time dimension mixing** (2024 ≠ 2010 ≠ 2019)

### ✅ Data Removed as Requested
- ❌ **Date và Store columns DELETED from Temp.csv** → FACT_STORE_PERFORMANCE has its own DIM_DATE_STORE and DIM_STORE
- ❌ **Crawl_Timestamp DELETED from tmdt_walmart.csv** → FACT_ECOMMERCE_SALES is snapshot-based (no time)

### ✅ Galaxy Schema Benefits
- **Optimized dashboards**: Mỗi dashboard chỉ dùng 1 star schema riêng
- **No NULL foreign keys**: Mỗi fact chỉ join với dimensions phù hợp
- **Clean separation**: 3 business processes hoàn toàn độc lập

---

## Data Flow (Medallion Architecture)

### Bronze Layer (Raw Data)
```
data/Raw/
├── Walmart_customer_purchases.csv → Star Schema 1
├── walmart_products.csv → Star Schema 1
├── marketing_data.csv → Star Schema 1
├── cleaned_products_API.csv → Star Schema 1
├── Temp.csv → Star Schema 2 (Date & Store removed)
└── tmdt_walmart.csv → Star Schema 3 (Crawl_Timestamp removed)
```

### Silver Layer (Cleaned)
```
pipelines/silver/transforming.py → data/Clean/
```

### Golden Layer (Galaxy Schema)
```
pipelines/golden/
├── standardize_columns.py → data/Golden/standardized/
│   ├── std_customer_purchases.csv (Star Schema 1)
│   ├── std_store_performance.csv (Star Schema 2, NO date/store columns)
│   └── std_ecommerce_sales.csv (Star Schema 3, NO crawl_timestamp)
│
├── build_dims.py → data/Golden/dimensions/
│   ├── DIM_PRODUCT, DIM_CUSTOMER, DIM_DATE, DIM_PAYMENT, DIM_CATEGORY (Schema 1)
│   ├── DIM_STORE, DIM_DATE_STORE, DIM_TEMPERATURE (Schema 2)
│   └── DIM_ECOMMERCE_PRODUCT, DIM_ECOMMERCE_CATEGORY, DIM_ECOMMERCE_BRAND (Schema 3)
│
└── build_facts.py → data/Golden/facts/
    ├── FACT_SALES (Schema 1)
    ├── FACT_STORE_PERFORMANCE (Schema 2)
    └── FACT_ECOMMERCE_SALES (Schema 3)
```

---

## Schema Statistics

| Star Schema | Fact Table | Rows | Dimensions | Time Period |
|-------------|------------|------|------------|-------------|
| **Schema 1** | FACT_SALES | 50,000 | 5 | 2024-2025 |
| **Schema 2** | FACT_STORE_PERFORMANCE | 6,435 | 3 | 2010-2012 |
| **Schema 3** | FACT_ECOMMERCE_SALES | 30,170 | 3 | 2019 snapshot |

---

## Dashboard Use Cases

### 📊 Dashboard 1: Retail Sales Analysis
- **Star Schema**: #1
- **Fact**: FACT_SALES
- **Dimensions**: DIM_PRODUCT, DIM_CUSTOMER, DIM_DATE, DIM_PAYMENT, DIM_CATEGORY
- **Metrics**: Sales by customer segment, product performance, payment method trends, daily/monthly sales

### 📊 Dashboard 2: Store Performance & Weather Impact
- **Star Schema**: #2
- **Fact**: FACT_STORE_PERFORMANCE
- **Dimensions**: DIM_STORE, DIM_DATE_STORE, DIM_TEMPERATURE
- **Metrics**: Weekly sales by store, temperature impact, fuel price correlation, holiday performance

### 📊 Dashboard 3: E-commerce Catalog Analysis
- **Star Schema**: #3
- **Fact**: FACT_ECOMMERCE_SALES
- **Dimensions**: DIM_ECOMMERCE_PRODUCT, DIM_ECOMMERCE_CATEGORY, DIM_ECOMMERCE_BRAND
- **Metrics**: Price distribution, discount analysis, brand performance, category breakdown

---

## Summary

✅ **3 Star Schemas hoàn toàn độc lập**  
✅ **Xóa Date/Store từ Temp.csv** (theo yêu cầu)  
✅ **Xóa Crawl_Timestamp từ tmdt_walmart.csv** (theo yêu cầu)  
✅ **Không có forced joins giữa data incompatible**  
✅ **Mỗi dashboard optimize riêng cho từng business process**  
✅ **Galaxy Schema tối ưu cho phân tích đa chiều**
