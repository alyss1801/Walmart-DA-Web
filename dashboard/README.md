# 🛒 Walmart Analytics Dashboard

Interactive multi-page dashboard for comprehensive Walmart business intelligence and data analytics. Built with Streamlit and powered by DuckDB data warehouse.

![Dashboard](https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![DuckDB](https://img.shields.io/badge/DuckDB-FFF000?style=for-the-badge&logo=duckdb&logoColor=black)

---

## 📊 Overview

This dashboard provides **interactive business intelligence** with 4 specialized dashboards, each addressing critical business questions:

### 🎯 Four Business Questions

1. **📊 Sales Performance Overview**
   - How are our sales performing over time and across different dimensions?
   - Track revenue trends, category performance, and geographic distribution

2. **👥 Customer Insights & Segmentation**
   - Who are our customers and what are their purchasing behaviors?
   - Analyze demographics, RFM segmentation, and customer lifetime value

3. **🏆 Product & Category Analysis**
   - Which products and categories perform best, and what drives their success?
   - Identify top performers, brand analysis, and rating insights

4. **💳 Payment & Promotion Analytics**
   - How effective are our promotions and what payment methods drive the most value?
   - Measure discount effectiveness, payment preferences, and promotion ROI

---

## ✨ Key Features

### 🔍 Interactive Filters
- **Date Range Selection** - Analyze any time period
- **Category Filtering** - Focus on specific product categories
- **Customer Demographics** - Filter by age group and gender
- **Payment Methods** - Analyze by payment type

### 📈 Rich Visualizations
- Line charts for trend analysis
- Bar charts for performance comparison
- Pie charts for distribution insights
- Scatter plots for correlation analysis
- Heatmaps for multi-dimensional analysis

### 📥 Data Export
- **CSV Export** - Download filtered data
- **Excel Export** - Formatted reports
- **Real-time Updates** - Fresh data on every interaction

---

## 🏗️ Architecture

### Data Pipeline (Medallion Architecture)

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Bronze    │ ───> │   Silver    │ ───> │    Gold     │
│  (Raw API)  │      │  (Cleaned)  │      │ (Analytics) │
└─────────────┘      └─────────────┘      └─────────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │  DuckDB         │
                                         │  Data Warehouse │
                                         └─────────────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │  Streamlit      │
                                         │  Dashboard      │
                                         └─────────────────┘
```

### Star Schema (Gold Layer)

**Dimensions (5 tables):**
- `DIM_PRODUCT` - Product details, brands, categories
- `DIM_CUSTOMER` - Customer demographics
- `DIM_DATE` - Time dimension with calendar attributes
- `DIM_PAYMENT` - Payment methods
- `DIM_CATEGORY` - Product categories hierarchy

**Fact (1 table):**
- `FACT_SALES` - Transaction-level sales data with measures

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- DuckDB warehouse (automatically created by pipeline)

### Installation

1. **Navigate to dashboard directory:**
   ```bash
   cd DA/dashboard
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Ensure data pipeline has been run:**
   - Run Bronze layer: `python WalmartAPI/pipeline.py`
   - Run Silver layer: `python pipelines/silver/run.py`
   - Run Gold layer: `python pipelines/golden/run_pipeline.py`

### Running the Dashboard

```bash
streamlit run Home.py
```

The dashboard will open automatically in your default browser at `http://localhost:8501`

---

## 📁 Project Structure

```
dashboard/
│
├── Home.py                          # Main landing page
├── config.py                        # Configuration settings
├── requirements.txt                 # Python dependencies
│
├── pages/                           # Dashboard pages
│   ├── 1_📊_Sales_Performance.py
│   ├── 2_👥_Customer_Insights.py
│   ├── 3_🏆_Product_Analysis.py
│   └── 4_💳_Payment_Promotions.py
│
├── utils/                           # Utility modules
│   ├── db_connector.py             # DuckDB connection layer
│   ├── chart_helpers.py            # Visualization helpers
│   └── components.py               # Reusable UI components
│
└── assets/                          # Static assets (images, etc.)
```

---

## 🎨 Dashboard Screenshots

### Home Page
- Welcome screen with dashboard overview
- Quick navigation to all dashboards
- Feature highlights

### Sales Performance
- KPI metrics (Revenue, Transactions, AOV)
- Daily/Monthly sales trends
- Category performance comparison
- Geographic distribution

### Customer Insights
- Customer segmentation (RFM analysis)
- Demographics breakdown
- Purchase behavior patterns
- Top customer analysis

### Product Analysis
- Best/worst performing products
- Category comparison matrix
- Brand performance
- Rating and price analysis

### Payment & Promotions
- Discount effectiveness metrics
- Payment method performance
- Promotion ROI tracking
- Customer segment analysis

---

## 🔧 Configuration

### Database Path
Update `config.py` to point to your DuckDB warehouse:

```python
DATABASE_PATH = BASE_DIR / "database" / "walmart_analytics.db"
```

### Color Scheme
Customize dashboard colors in `config.py`:

```python
COLORS = {
    "primary": "#0071CE",    # Walmart blue
    "secondary": "#FFC220",  # Walmart yellow
    "success": "#00A652",
    ...
}
```

---

## 📊 Data Model

### Fact Table Schema
```sql
FACT_SALES (
    transaction_id INT,
    date_key INT,
    customer_key INT,
    product_key INT,
    payment_key INT,
    category_key INT,
    purchase_amount DECIMAL,
    discount_applied INT,
    rating DECIMAL,
    repeat_customer INT
)
```

### Dimension Tables
- All dimension tables have surrogate keys
- Proper foreign key relationships
- Star schema optimized for OLAP queries

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Streamlit** | Interactive web dashboard framework |
| **DuckDB** | High-performance OLAP database |
| **Plotly** | Interactive data visualizations |
| **Pandas** | Data manipulation and analysis |
| **Python 3.9+** | Core programming language |

---

## 📈 Performance

- **Fast queries** - DuckDB columnar storage
- **Real-time filtering** - Interactive filter updates
- **50,000+ transactions** - Handles large datasets efficiently
- **Responsive UI** - Smooth user experience

---

## 🔒 Data Privacy

- Read-only database access
- No data modification from dashboard
- Secure local deployment
- Filter-based data isolation

---

## 🐛 Troubleshooting

### Common Issues

**Dashboard won't start:**
```bash
# Ensure all dependencies are installed
pip install -r requirements.txt --upgrade
```

**No data displayed:**
```bash
# Check if DuckDB warehouse exists
ls ../database/walmart_analytics.db

# If missing, run the pipeline
python ../pipelines/golden/run_pipeline.py
```

**Import errors:**
```bash
# Verify Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

---

## 🚀 Future Enhancements

- [ ] Real-time data refresh from API
- [ ] Advanced ML predictions (sales forecasting)
- [ ] Custom report builder
- [ ] Email alerts for KPI thresholds
- [ ] Mobile-responsive design
- [ ] Multi-user authentication
- [ ] Export to PowerPoint/PDF

---

## 📝 License

This project is part of the Walmart Data Analytics pipeline.

---

## 👥 Contributors

Built with ❤️ for business intelligence and data analytics.

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the data pipeline documentation
3. Ensure all upstream pipelines have run successfully

---

## 🎓 Usage Tips

1. **Start with Home page** - Get familiar with available dashboards
2. **Use filters wisely** - Combine multiple filters for deep insights
3. **Export data** - Download filtered data for offline analysis
4. **Compare metrics** - Use side-by-side visualizations
5. **Check date ranges** - Ensure appropriate time periods are selected

---

**Happy Analyzing! 📊✨**
