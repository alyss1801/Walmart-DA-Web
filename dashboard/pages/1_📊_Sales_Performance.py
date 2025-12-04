"""
Dashboard 1: Sales Performance Overview
Business Question: How are our sales performing over time and across different dimensions?
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from config import DATABASE_PATH, COLORS
from utils.db_connector import DatabaseConnector
from utils.chart_helpers import (
    create_line_chart, create_bar_chart, create_pie_chart,
    format_currency, format_number, format_percentage
)
from utils.components import render_sidebar_filters, render_download_buttons


def main():
    st.set_page_config(page_title="Sales Performance", page_icon="📊", layout="wide")
    
    st.title("📊 Sales Performance Overview")
    st.markdown("### Analyze sales trends, revenue, and performance metrics")
    
    # Initialize database connection
    with DatabaseConnector(DATABASE_PATH) as db:
        # Get filter options
        filter_options = db.get_filter_options()
        
        # Render sidebar filters
        filters = render_sidebar_filters(filter_options)
        
        # Load data with filters
        df_sales = db.get_fact_sales(filters)
        
        if df_sales.empty:
            st.warning("No data available for the selected filters.")
            return
        
        # Convert date column
        df_sales['full_date'] = pd.to_datetime(df_sales['full_date'])
        
        # =====================================================================
        # KPI METRICS
        # =====================================================================
        st.header("🎯 Key Performance Indicators")
        
        col1, col2, col3, col4, col5 = st.columns(5)
        
        with col1:
            total_revenue = df_sales['purchase_amount'].sum()
            st.metric(
                "Total Revenue",
                format_currency(total_revenue),
                help="Total sales revenue in the selected period"
            )
        
        with col2:
            total_transactions = len(df_sales)
            st.metric(
                "Total Transactions",
                format_number(total_transactions),
                help="Number of completed transactions"
            )
        
        with col3:
            avg_order_value = df_sales['purchase_amount'].mean()
            st.metric(
                "Avg Order Value",
                format_currency(avg_order_value),
                help="Average transaction amount"
            )
        
        with col4:
            total_discount = df_sales[df_sales['discount_applied'] == 1]['purchase_amount'].sum()
            discount_rate = (total_discount / total_revenue * 100) if total_revenue > 0 else 0
            st.metric(
                "Discount Rate",
                format_percentage(discount_rate),
                help="Percentage of sales with discounts"
            )
        
        with col5:
            repeat_rate = (df_sales['repeat_customer'].sum() / total_transactions * 100) if total_transactions > 0 else 0
            st.metric(
                "Repeat Customer Rate",
                format_percentage(repeat_rate),
                help="Percentage of repeat customers"
            )
        
        st.divider()
        
        # =====================================================================
        # SALES TREND OVER TIME
        # =====================================================================
        st.header("📈 Sales Trend Analysis")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            # Daily sales trend
            daily_sales = df_sales.groupby('full_date').agg({
                'purchase_amount': 'sum',
                'transaction_id': 'count'
            }).reset_index()
            daily_sales.columns = ['Date', 'Revenue', 'Transactions']
            
            fig_trend = go.Figure()
            fig_trend.add_trace(go.Scatter(
                x=daily_sales['Date'],
                y=daily_sales['Revenue'],
                name='Revenue',
                line=dict(color=COLORS['primary'], width=3),
                fill='tozeroy',
                fillcolor='rgba(0, 113, 206, 0.1)'
            ))
            
            fig_trend.update_layout(
                title="Daily Sales Revenue",
                xaxis_title="Date",
                yaxis_title="Revenue ($)",
                template='plotly_white',
                hovermode='x unified',
                height=400
            )
            
            st.plotly_chart(fig_trend, use_container_width=True)
        
        with col2:
            # Sales by day of week
            dow_sales = df_sales.groupby('day_of_week')['purchase_amount'].sum().reset_index()
            dow_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            dow_sales['day_of_week'] = pd.Categorical(dow_sales['day_of_week'], categories=dow_order, ordered=True)
            dow_sales = dow_sales.sort_values('day_of_week')
            
            fig_dow = create_bar_chart(
                dow_sales,
                x='day_of_week',
                y='purchase_amount',
                title="Sales by Day of Week",
                color_discrete_sequence=[COLORS['secondary']]
            )
            fig_dow.update_layout(height=400)
            st.plotly_chart(fig_dow, use_container_width=True)
        
        # =====================================================================
        # CATEGORY & PRODUCT ANALYSIS
        # =====================================================================
        st.header("🏷️ Category & Product Performance")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Revenue by category
            category_sales = df_sales.groupby('root_category_name')['purchase_amount'].sum().reset_index()
            category_sales = category_sales.sort_values('purchase_amount', ascending=False).head(10)
            
            fig_category = create_bar_chart(
                category_sales,
                x='purchase_amount',
                y='root_category_name',
                title="Top 10 Categories by Revenue",
                orientation='h',
                color_discrete_sequence=[COLORS['primary']]
            )
            st.plotly_chart(fig_category, use_container_width=True)
        
        with col2:
            # Category distribution pie chart
            category_dist = df_sales.groupby('root_category_name')['purchase_amount'].sum().reset_index()
            category_dist = category_dist.sort_values('purchase_amount', ascending=False).head(8)
            
            fig_pie = create_pie_chart(
                category_dist,
                names='root_category_name',
                values='purchase_amount',
                title="Revenue Distribution by Category (Top 8)",
                hole=0.4
            )
            st.plotly_chart(fig_pie, use_container_width=True)
        
        # =====================================================================
        # TOP PRODUCTS
        # =====================================================================
        st.header("🏆 Top Performing Products")
        
        top_products = df_sales.groupby(['product_name', 'brand']).agg({
            'purchase_amount': 'sum',
            'transaction_id': 'count',
            'product_rating': 'mean'
        }).reset_index()
        top_products.columns = ['Product', 'Brand', 'Revenue', 'Sales Count', 'Avg Rating']
        top_products = top_products.sort_values('Revenue', ascending=False).head(20)
        
        # Format columns
        top_products['Revenue'] = top_products['Revenue'].apply(format_currency)
        top_products['Sales Count'] = top_products['Sales Count'].apply(lambda x: format_number(x))
        top_products['Avg Rating'] = top_products['Avg Rating'].apply(lambda x: f"{x:.1f}" if pd.notna(x) else "N/A")
        
        st.dataframe(
            top_products,
            use_container_width=True,
            height=400,
            hide_index=True
        )
        
        # =====================================================================
        # GEOGRAPHICAL ANALYSIS
        # =====================================================================
        st.header("🗺️ Sales by Location")
        
        city_sales = df_sales.groupby('city').agg({
            'purchase_amount': 'sum',
            'transaction_id': 'count'
        }).reset_index()
        city_sales.columns = ['City', 'Revenue', 'Transactions']
        city_sales = city_sales.sort_values('Revenue', ascending=False).head(15)
        
        fig_city = create_bar_chart(
            city_sales,
            x='City',
            y='Revenue',
            title="Top 15 Cities by Revenue",
            color_discrete_sequence=[COLORS['success']]
        )
        st.plotly_chart(fig_city, use_container_width=True)
        
        # =====================================================================
        # DOWNLOAD DATA
        # =====================================================================
        st.divider()
        st.subheader("📥 Export Data")
        render_download_buttons(df_sales, "sales_performance")


if __name__ == "__main__":
    main()
