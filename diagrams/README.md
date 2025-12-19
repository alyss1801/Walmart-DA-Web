# 📊 Walmart Galaxy Schema - PlantUML Diagrams

Folder này chứa các file PlantUML vẽ cho Galaxy Schema và Data Pipeline của dự án Walmart Data Analytics.

## 📁 File Structure

```
diagrams/
├── star_schema_retail_sales.puml          # Star Schema 1: Retail Sales
├── star_schema_store_performance.puml     # Star Schema 2: Store Performance
├── star_schema_ecommerce.puml             # Star Schema 3: E-commerce Sales
├── data_pipeline_with_quality_gates.puml  # Data Pipeline với Quality Gates
└── README.md                              # This file
```

## 🌟 Star Schema Overview

### 1. Retail Sales Star Schema
- **Fact Table:** `FACT_SALES` (~50,000 records)
- **Dimensions:** DIM_DATE, DIM_CUSTOMER, DIM_PRODUCT, DIM_PAYMENT, DIM_CATEGORY
- **Purpose:** Analyze customer purchases, payment methods, product performance, and demographics

### 2. Store Performance Star Schema
- **Fact Table:** `FACT_STORE_PERFORMANCE` (6,435 records)
- **Dimensions:** DIM_DATE_STORE, DIM_STORE, DIM_TEMPERATURE
- **Purpose:** Analyze store metrics with economic indicators (CPI, unemployment, fuel price)

### 3. E-commerce Sales Star Schema
- **Fact Table:** `FACT_ECOMMERCE_SALES` (~30,170 records)
- **Dimensions:** DIM_ECOMMERCE_PRODUCT, DIM_ECOMMERCE_CATEGORY, DIM_ECOMMERCE_BRAND
- **Purpose:** Analyze product pricing, discounts, and brand performance

## 🛠️ How to Generate Diagrams

### Option 1: VS Code Extension
1. Install extension: **PlantUML** by jebbs
2. Open any `.puml` file
3. Press `Alt + D` to preview diagram
4. Right-click → Export to PNG/SVG

### Option 2: Online PlantUML Server
1. Go to [https://www.plantuml.com/plantuml](https://www.plantuml.com/plantuml)
2. Copy/paste the content of `.puml` file
3. Click "Submit" to generate diagram

### Option 3: Command Line (với PlantUML JAR)
```bash
# Generate PNG
java -jar plantuml.jar star_schema_retail_sales.puml

# Generate SVG
java -jar plantuml.jar -tsvg star_schema_retail_sales.puml

# Generate all diagrams
java -jar plantuml.jar *.puml
```

## 🎨 Color Scheme

| Color | Hex Code | Usage |
|-------|----------|-------|
| Walmart Blue | `#0071CE` | Border, Foreign Keys |
| Walmart Yellow | `#FFC220` | Fact Tables |
| Light Blue | `#E8F4FD` | Dimension Tables |

## 📝 Diagram Legend

- **[PK]** - Primary Key
- **[FK]** - Foreign Key
- **Yellow boxes** - Fact tables (contains measures/metrics)
- **Light blue boxes** - Dimension tables (contains attributes)

---
*Generated for Walmart Data Analytics Project - Galaxy Schema Architecture*
