"""
Dashboard 3: Product & Category Analysis
Business Question: Which products and categories perform best, and what drives their success?
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
    create_line_chart, create_bar_chart, create_pie_chart, create_scatter_chart, create_box_chart,
    format_currency, format_number, format_percentage
)
from utils.components import render_sidebar_filters, render_download_buttons


def main():
    st.set_page_config(page_title="Product Analysis", page_icon="🏆", layout="wide")
    
    st.title("🏆 Product & Category Analysis")
    st.markdown("### Deep dive into product performance, ratings, and category insights")
    
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
        # PRODUCT KPIs
        # =====================================================================
        st.header("🎯 Product Performance Metrics")
        
        col1, col2, col3, col4, col5 = st.columns(5)
        
        with col1:
            total_products = df_sales['product_id'].nunique()
            st.metric(
                "Total Products Sold",
                format_number(total_products),
                help="Unique products in the selected period"
            )
        
        with col2:
            total_categories = df_sales['root_category_name'].nunique()
            st.metric(
                "Product Categories",
                format_number(total_categories),
                help="Number of unique product categories"
            )
        
        with col3:
            avg_product_rating = df_sales['product_rating'].mean()
            st.metric(
                "Avg Product Rating",
                f"{avg_product_rating:.2f} ⭐",
                help="Average product rating"
            )
        
        with col4:
            total_brands = df_sales['brand'].nunique()
            st.metric(
                "Total Brands",
                format_number(total_brands),
                help="Number of unique brands"
            )
        
        with col5:
            best_seller_sales = df_sales.groupby('product_id')['transaction_id'].count().max()
            st.metric(
                "Best Seller Sales",
                format_number(best_seller_sales),
                help="Sales count of top-selling product"
            )
        
        st.divider()
        
        # =====================================================================
        # CATEGORY PERFORMANCE
        # =====================================================================
        st.header("📦 Category Performance")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Top categories by revenue
            category_revenue = df_sales.groupby('root_category_name').agg({
                'purchase_amount': 'sum',
                'transaction_id': 'count',
                'product_id': 'nunique'
            }).reset_index()
            category_revenue.columns = ['Category', 'Revenue', 'Sales Count', 'Products']
            category_revenue = category_revenue.sort_values('Revenue', ascending=False).head(15)
            
            fig_cat_revenue = create_bar_chart(
                category_revenue,
                x='Revenue',
                y='Category',
                title="Top 15 Categories by Revenue",
                orientation='h',
                color_discrete_sequence=[COLORS['primary']]
            )
            st.plotly_chart(fig_cat_revenue, use_container_width=True)
        
        with col2:
            # Category sales count
            fig_cat_sales = create_bar_chart(
                category_revenue,
                x='Sales Count',
                y='Category',
                title="Top 15 Categories by Sales Volume",
                orientation='h',
                color_discrete_sequence=[COLORS['success']]
            )
            st.plotly_chart(fig_cat_sales, use_container_width=True)
        
        # Category comparison table
        st.subheader("📊 Category Comparison Matrix")
        
        category_metrics = df_sales.groupby('root_category_name').agg({
            'purchase_amount': ['sum', 'mean'],
            'transaction_id': 'count',
            'product_id': 'nunique',
            'product_rating': 'mean',
            'discount_applied': lambda x: (x == 1).sum()
        }).reset_index()
        
        category_metrics.columns = ['Category', 'Total Revenue', 'Avg Order Value', 
                                    'Sales Count', 'Products', 'Avg Rating', 'Discounted Sales']
        category_metrics = category_metrics.sort_values('Total Revenue', ascending=False).head(20)
        
        # Format columns
        category_metrics['Total Revenue'] = category_metrics['Total Revenue'].apply(format_currency)
        category_metrics['Avg Order Value'] = category_metrics['Avg Order Value'].apply(format_currency)
        category_metrics['Avg Rating'] = category_metrics['Avg Rating'].apply(lambda x: f"{x:.2f}" if pd.notna(x) else "N/A")
        category_metrics['Discount Rate'] = (category_metrics['Discounted Sales'] / 
                                             category_metrics['Sales Count'] * 100).apply(lambda x: f"{x:.1f}%")
        
        st.dataframe(
            category_metrics[['Category', 'Total Revenue', 'Sales Count', 'Products', 
                            'Avg Order Value', 'Avg Rating', 'Discount Rate']],
            use_container_width=True,
            height=400,
            hide_index=True
        )
        
        # =====================================================================
        # TOP PRODUCTS
        # =====================================================================
        st.header("🌟 Best Performing Products")
        
        tab1, tab2, tab3 = st.tabs(["By Revenue", "By Sales Volume", "By Rating"])
        
        with tab1:
            # Top products by revenue
            top_revenue = df_sales.groupby(['product_name', 'brand', 'root_category_name']).agg({
                'purchase_amount': 'sum',
                'transaction_id': 'count',
                'product_rating': 'mean'
            }).reset_index()
            top_revenue = top_revenue.sort_values('purchase_amount', ascending=False).head(20)
            top_revenue.columns = ['Product', 'Brand', 'Category', 'Revenue', 'Sales', 'Rating']
            
            fig_top_revenue = create_bar_chart(
                top_revenue.head(10),
                x='Revenue',
                y='Product',
                title="Top 10 Products by Revenue",
                orientation='h',
                color_discrete_sequence=[COLORS['primary']]
            )
            fig_top_revenue.update_yaxes(tickmode='linear')
            st.plotly_chart(fig_top_revenue, use_container_width=True)
            
            # Show table
            top_revenue['Revenue'] = top_revenue['Revenue'].apply(format_currency)
            top_revenue['Rating'] = top_revenue['Rating'].apply(lambda x: f"{x:.1f}" if pd.notna(x) else "N/A")
            st.dataframe(top_revenue, use_container_width=True, hide_index=True)
        
        with tab2:
            # Top products by volume
            top_volume = df_sales.groupby(['product_name', 'brand', 'root_category_name']).agg({
                'transaction_id': 'count',
                'purchase_amount': 'sum',
                'product_rating': 'mean'
            }).reset_index()
            top_volume = top_volume.sort_values('transaction_id', ascending=False).head(20)
            top_volume.columns = ['Product', 'Brand', 'Category', 'Sales', 'Revenue', 'Rating']
            
            fig_top_volume = create_bar_chart(
                top_volume.head(10),
                x='Sales',
                y='Product',
                title="Top 10 Products by Sales Volume",
                orientation='h',
                color_discrete_sequence=[COLORS['success']]
            )
            st.plotly_chart(fig_top_volume, use_container_width=True)
            
            # Show table
            top_volume['Revenue'] = top_volume['Revenue'].apply(format_currency)
            top_volume['Rating'] = top_volume['Rating'].apply(lambda x: f"{x:.1f}" if pd.notna(x) else "N/A")
            st.dataframe(top_volume, use_container_width=True, hide_index=True)
        
        with tab3:
            # Top rated products (with minimum sales threshold)
            min_sales = 5
            top_rated = df_sales.groupby(['product_name', 'brand', 'root_category_name']).agg({
                'product_rating': 'mean',
                'transaction_id': 'count',
                'purchase_amount': 'sum'
            }).reset_index()
            top_rated = top_rated[top_rated['transaction_id'] >= min_sales]
            top_rated = top_rated.sort_values('product_rating', ascending=False).head(20)
            top_rated.columns = ['Product', 'Brand', 'Category', 'Rating', 'Sales', 'Revenue']
            
            fig_top_rated = create_bar_chart(
                top_rated.head(10),
                x='Rating',
                y='Product',
                title=f"Top 10 Highest Rated Products (min {min_sales} sales)",
                orientation='h',
                color_discrete_sequence=[COLORS['warning']]
            )
            st.plotly_chart(fig_top_rated, use_container_width=True)
            
            # Show table
            top_rated['Revenue'] = top_rated['Revenue'].apply(format_currency)
            top_rated['Rating'] = top_rated['Rating'].apply(lambda x: f"{x:.2f}")
            st.dataframe(top_rated, use_container_width=True, hide_index=True)
        
        # =====================================================================
        # BRAND ANALYSIS
        # =====================================================================
        st.header("🏢 Brand Performance")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Top brands by revenue
            brand_perf = df_sales.groupby('brand').agg({
                'purchase_amount': 'sum',
                'transaction_id': 'count',
                'product_id': 'nunique'
            }).reset_index()
            brand_perf.columns = ['Brand', 'Revenue', 'Sales', 'Products']
            brand_perf = brand_perf.sort_values('Revenue', ascending=False).head(15)
            
            fig_brand = create_bar_chart(
                brand_perf,
                x='Brand',
                y='Revenue',
                title="Top 15 Brands by Revenue",
                color_discrete_sequence=[COLORS['info']]
            )
            fig_brand.update_xaxis(tickangle=45)
            st.plotly_chart(fig_brand, use_container_width=True)
        
        with col2:
            # Brand market share (top 10)
            brand_share = brand_perf.head(10)
            fig_brand_share = create_pie_chart(
                brand_share,
                names='Brand',
                values='Revenue',
                title="Top 10 Brand Market Share by Revenue",
                hole=0.4
            )
            st.plotly_chart(fig_brand_share, use_container_width=True)
        
        # =====================================================================
        # RATING ANALYSIS
        # =====================================================================
        st.header("⭐ Product Rating Analysis")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Rating distribution
            rating_dist = df_sales['product_rating'].value_counts().reset_index()
            rating_dist.columns = ['Rating', 'Count']
            rating_dist = rating_dist.sort_values('Rating')
            
            fig_rating = create_bar_chart(
                rating_dist,
                x='Rating',
                y='Count',
                title="Product Rating Distribution",
                color_discrete_sequence=[COLORS['secondary']]
            )
            st.plotly_chart(fig_rating, use_container_width=True)
        
        with col2:
            # Revenue vs Rating scatter
            product_metrics = df_sales.groupby('product_id').agg({
                'purchase_amount': 'sum',
                'product_rating': 'mean',
                'transaction_id': 'count'
            }).reset_index()
            
            fig_scatter = create_scatter_chart(
                product_metrics[product_metrics['transaction_id'] >= 3],
                x='product_rating',
                y='purchase_amount',
                size='transaction_id',
                title="Revenue vs Product Rating",
                labels={'product_rating': 'Average Rating', 'purchase_amount': 'Total Revenue ($)'}
            )
            st.plotly_chart(fig_scatter, use_container_width=True)
        
        # =====================================================================
        # PRICE ANALYSIS
        # =====================================================================
        st.header("💰 Price Point Analysis")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Price distribution by category
            category_list = df_sales['root_category_name'].value_counts().head(8).index.tolist()
            price_by_cat = df_sales[df_sales['root_category_name'].isin(category_list)]
            
            fig_price_box = create_box_chart(
                price_by_cat,
                x='root_category_name',
                y='purchase_amount',
                title="Price Distribution by Top Categories"
            )
            fig_price_box.update_xaxis(tickangle=45)
            st.plotly_chart(fig_price_box, use_container_width=True)
        
        with col2:
            # Average price by category
            avg_price_cat = df_sales.groupby('root_category_name')['purchase_amount'].mean().reset_index()
            avg_price_cat = avg_price_cat.sort_values('purchase_amount', ascending=False).head(15)
            avg_price_cat.columns = ['Category', 'Avg Price']
            
            fig_avg_price = create_bar_chart(
                avg_price_cat,
                x='Avg Price',
                y='Category',
                title="Average Price by Category",
                orientation='h',
                color_discrete_sequence=[COLORS['danger']]
            )
            st.plotly_chart(fig_avg_price, use_container_width=True)
        
        # =====================================================================
        # DOWNLOAD DATA
        # =====================================================================
        st.divider()
        st.subheader("📥 Export Data")
        render_download_buttons(df_sales, "product_analysis")


if __name__ == "__main__":
    main()
