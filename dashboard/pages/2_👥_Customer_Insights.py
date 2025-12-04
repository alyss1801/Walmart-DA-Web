"""
Dashboard 2: Customer Insights & Segmentation
Business Question: Who are our customers and what are their purchasing behaviors?
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
    create_line_chart, create_bar_chart, create_pie_chart, create_scatter_chart,
    format_currency, format_number, format_percentage
)
from utils.components import render_sidebar_filters, render_download_buttons


def main():
    st.set_page_config(page_title="Customer Insights", page_icon="👥", layout="wide")
    
    st.title("👥 Customer Insights & Segmentation")
    st.markdown("### Understand customer demographics, behavior, and lifetime value")
    
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
        
        # =====================================================================
        # CUSTOMER KPIs
        # =====================================================================
        st.header("🎯 Customer Metrics")
        
        col1, col2, col3, col4, col5 = st.columns(5)
        
        with col1:
            total_customers = df_sales['customer_id'].nunique()
            st.metric(
                "Total Customers",
                format_number(total_customers),
                help="Unique customers in the selected period"
            )
        
        with col2:
            avg_purchase = df_sales.groupby('customer_id')['purchase_amount'].sum().mean()
            st.metric(
                "Avg Customer Value",
                format_currency(avg_purchase),
                help="Average total spending per customer"
            )
        
        with col3:
            avg_frequency = df_sales.groupby('customer_id')['transaction_id'].count().mean()
            st.metric(
                "Avg Purchase Frequency",
                f"{avg_frequency:.1f}",
                help="Average number of purchases per customer"
            )
        
        with col4:
            repeat_customers = df_sales[df_sales['repeat_customer'] == 1]['customer_id'].nunique()
            repeat_rate = (repeat_customers / total_customers * 100) if total_customers > 0 else 0
            st.metric(
                "Repeat Customer Rate",
                format_percentage(repeat_rate),
                help="Percentage of customers who made repeat purchases"
            )
        
        with col5:
            avg_rating = df_sales['transaction_rating'].mean()
            st.metric(
                "Avg Customer Rating",
                f"{avg_rating:.2f} ⭐",
                help="Average customer satisfaction rating"
            )
        
        st.divider()
        
        # =====================================================================
        # DEMOGRAPHIC ANALYSIS
        # =====================================================================
        st.header("📊 Customer Demographics")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            # Age group distribution
            age_dist = df_sales.groupby('age_group').agg({
                'customer_id': 'nunique',
                'purchase_amount': 'sum'
            }).reset_index()
            age_dist.columns = ['Age Group', 'Customers', 'Revenue']
            
            fig_age = create_bar_chart(
                age_dist,
                x='Age Group',
                y='Customers',
                title="Customer Distribution by Age Group",
                color_discrete_sequence=[COLORS['primary']]
            )
            st.plotly_chart(fig_age, use_container_width=True)
        
        with col2:
            # Gender distribution
            gender_dist = df_sales.groupby('gender').agg({
                'customer_id': 'nunique',
                'purchase_amount': 'sum'
            }).reset_index()
            gender_dist.columns = ['Gender', 'Customers', 'Revenue']
            
            fig_gender = create_pie_chart(
                gender_dist,
                names='Gender',
                values='Customers',
                title="Customer Distribution by Gender",
                hole=0.4
            )
            st.plotly_chart(fig_gender, use_container_width=True)
        
        with col3:
            # Revenue by age group
            fig_age_revenue = create_bar_chart(
                age_dist,
                x='Age Group',
                y='Revenue',
                title="Revenue by Age Group",
                color_discrete_sequence=[COLORS['success']]
            )
            st.plotly_chart(fig_age_revenue, use_container_width=True)
        
        # =====================================================================
        # CUSTOMER SEGMENTATION (RFM-like)
        # =====================================================================
        st.header("🎯 Customer Segmentation")
        
        # Calculate customer metrics
        customer_metrics = df_sales.groupby('customer_id').agg({
            'full_date': 'max',
            'transaction_id': 'count',
            'purchase_amount': 'sum'
        }).reset_index()
        customer_metrics.columns = ['customer_id', 'last_purchase', 'frequency', 'monetary']
        
        # Add demographic info
        customer_demo = df_sales[['customer_id', 'age', 'gender', 'city', 'age_group']].drop_duplicates()
        customer_metrics = customer_metrics.merge(customer_demo, on='customer_id', how='left')
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Frequency vs Monetary scatter
            fig_scatter = create_scatter_chart(
                customer_metrics,
                x='frequency',
                y='monetary',
                color='age_group',
                size='monetary',
                title="Customer Segmentation: Purchase Frequency vs Total Spending",
                labels={'frequency': 'Number of Purchases', 'monetary': 'Total Spending ($)'}
            )
            st.plotly_chart(fig_scatter, use_container_width=True)
        
        with col2:
            # Customer value segments
            customer_metrics['segment'] = pd.qcut(
                customer_metrics['monetary'], 
                q=4, 
                labels=['Low Value', 'Medium Value', 'High Value', 'VIP']
            )
            
            segment_dist = customer_metrics['segment'].value_counts().reset_index()
            segment_dist.columns = ['Segment', 'Count']
            
            fig_segment = create_pie_chart(
                segment_dist,
                names='Segment',
                values='Count',
                title="Customer Value Segmentation",
                hole=0.4
            )
            st.plotly_chart(fig_segment, use_container_width=True)
        
        # =====================================================================
        # TOP CUSTOMERS
        # =====================================================================
        st.header("🏆 Top Customers by Value")
        
        top_customers = customer_metrics.nlargest(20, 'monetary')[
            ['customer_id', 'age', 'gender', 'city', 'frequency', 'monetary', 'segment']
        ].copy()
        
        top_customers.columns = ['Customer ID', 'Age', 'Gender', 'City', 'Purchases', 'Total Spent', 'Segment']
        top_customers['Total Spent'] = top_customers['Total Spent'].apply(format_currency)
        
        st.dataframe(
            top_customers,
            use_container_width=True,
            height=400,
            hide_index=True
        )
        
        # =====================================================================
        # GEOGRAPHIC DISTRIBUTION
        # =====================================================================
        st.header("🗺️ Customer Geographic Distribution")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            # Top cities by customers
            city_customers = df_sales.groupby('city').agg({
                'customer_id': 'nunique',
                'purchase_amount': 'sum'
            }).reset_index()
            city_customers.columns = ['City', 'Customers', 'Revenue']
            city_customers = city_customers.sort_values('Customers', ascending=False).head(15)
            
            fig_city = create_bar_chart(
                city_customers,
                x='City',
                y='Customers',
                title="Top 15 Cities by Customer Count",
                color_discrete_sequence=[COLORS['info']]
            )
            st.plotly_chart(fig_city, use_container_width=True)
        
        with col2:
            # City metrics
            st.metric("Total Cities", format_number(df_sales['city'].nunique()))
            st.metric("Avg Customers per City", format_number(df_sales.groupby('city')['customer_id'].nunique().mean()))
            
            top_city = city_customers.iloc[0]
            st.info(f"**Top City:** {top_city['City']}\n\n"
                   f"**Customers:** {format_number(top_city['Customers'])}\n\n"
                   f"**Revenue:** {format_currency(top_city['Revenue'])}")
        
        # =====================================================================
        # PURCHASE BEHAVIOR ANALYSIS
        # =====================================================================
        st.header("🛒 Purchase Behavior Patterns")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Purchase frequency distribution
            freq_dist = customer_metrics.groupby('frequency').size().reset_index()
            freq_dist.columns = ['Purchases', 'Customers']
            freq_dist = freq_dist[freq_dist['Purchases'] <= 20]  # Limit for readability
            
            fig_freq = create_bar_chart(
                freq_dist,
                x='Purchases',
                y='Customers',
                title="Customer Purchase Frequency Distribution",
                color_discrete_sequence=[COLORS['warning']]
            )
            st.plotly_chart(fig_freq, use_container_width=True)
        
        with col2:
            # Average spending by age and gender
            age_gender_spend = df_sales.groupby(['age_group', 'gender'])['purchase_amount'].mean().reset_index()
            age_gender_spend.columns = ['Age Group', 'Gender', 'Avg Spending']
            
            fig_heatmap = px.density_heatmap(
                age_gender_spend,
                x='Age Group',
                y='Gender',
                z='Avg Spending',
                title="Average Spending by Age Group and Gender",
                color_continuous_scale='Blues'
            )
            st.plotly_chart(fig_heatmap, use_container_width=True)
        
        # =====================================================================
        # DOWNLOAD DATA
        # =====================================================================
        st.divider()
        st.subheader("📥 Export Data")
        render_download_buttons(customer_metrics, "customer_insights")


if __name__ == "__main__":
    main()
