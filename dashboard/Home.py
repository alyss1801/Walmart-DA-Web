"""
Walmart Analytics Dashboard - Main Application
Multi-page interactive dashboard for business intelligence
"""

import streamlit as st
import sys
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

from config import APP_TITLE, PAGE_ICON, LAYOUT, COLORS


def main():
    # Page configuration
    st.set_page_config(
        page_title=APP_TITLE,
        page_icon=PAGE_ICON,
        layout=LAYOUT,
        initial_sidebar_state="expanded",
    )
    
    # Custom CSS for better styling
    st.markdown("""
        <style>
        /* Main header styling */
        .main-header {
            background: linear-gradient(135deg, #0071CE 0%, #004C91 100%);
            padding: 2rem;
            border-radius: 10px;
            color: white;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .main-header h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: bold;
        }
        
        .main-header p {
            margin: 0.5rem 0 0 0;
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        /* Card styling */
        .dashboard-card {
            background: white;
            padding: 1.5rem;
            border-radius: 10px;
            border-left: 4px solid #0071CE;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 1rem;
            transition: transform 0.2s;
        }
        
        .dashboard-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .dashboard-card h3 {
            color: #0071CE;
            margin-top: 0;
        }
        
        /* Metric styling */
        .stMetric {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 1rem;
            border-radius: 8px;
        }
        
        /* Sidebar styling */
        section[data-testid="stSidebar"] {
            background-color: #f8f9fa;
        }
        
        /* Button styling */
        .stButton>button {
            background: linear-gradient(135deg, #0071CE 0%, #004C91 100%);
            color: white;
            border: none;
            border-radius: 5px;
            padding: 0.5rem 2rem;
            font-weight: bold;
        }
        
        .stButton>button:hover {
            background: linear-gradient(135deg, #004C91 0%, #003366 100%);
        }
        
        /* Hide Streamlit branding */
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        </style>
    """, unsafe_allow_html=True)
    
    # Main header
    st.markdown(f"""
        <div class="main-header">
            <h1>{PAGE_ICON} {APP_TITLE}</h1>
            <p>Interactive Business Intelligence Dashboard for Walmart Data Analytics</p>
        </div>
    """, unsafe_allow_html=True)
    
    # Welcome section
    st.markdown("## 👋 Welcome to Walmart Analytics Dashboard")
    
    st.markdown("""
    This comprehensive dashboard provides deep insights into your Walmart business data through
    interactive visualizations and advanced analytics. Navigate through different sections using
    the sidebar to explore various aspects of your business.
    """)
    
    st.divider()
    
    # Dashboard overview
    st.markdown("## 📊 Available Dashboards")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        <div class="dashboard-card">
            <h3>📊 Sales Performance Overview</h3>
            <p><strong>Business Question:</strong> How are our sales performing over time and across different dimensions?</p>
            <ul>
                <li>Sales trends and revenue analysis</li>
                <li>Category and product performance</li>
                <li>Geographic sales distribution</li>
                <li>KPI tracking and metrics</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("""
        <div class="dashboard-card">
            <h3>👥 Customer Insights & Segmentation</h3>
            <p><strong>Business Question:</strong> Who are our customers and what are their purchasing behaviors?</p>
            <ul>
                <li>Customer demographics analysis</li>
                <li>RFM segmentation (Recency, Frequency, Monetary)</li>
                <li>Purchase behavior patterns</li>
                <li>Customer lifetime value</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="dashboard-card">
            <h3>🏆 Product & Category Analysis</h3>
            <p><strong>Business Question:</strong> Which products and categories perform best, and what drives their success?</p>
            <ul>
                <li>Top performing products and categories</li>
                <li>Brand performance comparison</li>
                <li>Product rating analysis</li>
                <li>Price point optimization</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("""
        <div class="dashboard-card">
            <h3>💳 Payment & Promotion Analytics</h3>
            <p><strong>Business Question:</strong> How effective are our promotions and what payment methods drive the most value?</p>
            <ul>
                <li>Discount effectiveness analysis</li>
                <li>Payment method performance</li>
                <li>Promotion ROI tracking</li>
                <li>Customer segment discount usage</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    st.divider()
    
    # Features section
    st.markdown("## ✨ Key Features")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        ### 🔍 Interactive Filters
        - Date range selection
        - Category filtering
        - Customer demographics
        - Payment methods
        """)
    
    with col2:
        st.markdown("""
        ### 📈 Rich Visualizations
        - Line charts for trends
        - Bar charts for comparisons
        - Pie charts for distributions
        - Scatter plots for correlations
        """)
    
    with col3:
        st.markdown("""
        ### 📥 Data Export
        - CSV downloads
        - Excel exports
        - Real-time data refresh
        - Custom date ranges
        """)
    
    st.divider()
    
    # Getting started
    st.markdown("## 🚀 Getting Started")
    
    st.info("""
    **To begin exploring your data:**
    1. Select a dashboard from the sidebar navigation
    2. Use the filters to customize your view
    3. Interact with charts for detailed insights
    4. Export data for further analysis
    """)
    
    # Technical info
    with st.expander("ℹ️ Technical Information"):
        st.markdown("""
        ### Data Pipeline Architecture
        This dashboard is powered by a **Medallion Architecture** data pipeline:
        
        - **Bronze Layer:** Raw data ingestion from Walmart API
        - **Silver Layer:** Cleaned and transformed data with quality checks
        - **Gold Layer:** Business-ready star schema optimized for analytics
        
        ### Technology Stack
        - **Frontend:** Streamlit
        - **Database:** DuckDB (OLAP warehouse)
        - **Visualization:** Plotly
        - **Data Processing:** Pandas, NumPy
        
        ### Data Model
        Star schema with 5 dimension tables and 1 fact table:
        - DIM_PRODUCT, DIM_CUSTOMER, DIM_DATE, DIM_PAYMENT, DIM_CATEGORY
        - FACT_SALES (50,000+ transactions)
        """)
    
    # Footer
    st.divider()
    st.markdown("""
        <div style="text-align: center; color: #666; padding: 2rem;">
            <p><strong>Walmart Analytics Dashboard</strong> | Built with ❤️ using Streamlit</p>
            <p>© 2024 - All rights reserved</p>
        </div>
    """, unsafe_allow_html=True)


if __name__ == "__main__":
    main()
