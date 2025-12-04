"""
Dashboard 4: Payment & Promotion Analytics
Business Question: How effective are our promotions and what payment methods drive the most value?
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
    st.set_page_config(page_title="Payment & Promotions", page_icon="💳", layout="wide")
    
    st.title("💳 Payment & Promotion Analytics")
    st.markdown("### Analyze discount effectiveness and payment method performance")
    
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
        # PAYMENT & PROMOTION KPIs
        # =====================================================================
        st.header("🎯 Key Metrics")
        
        col1, col2, col3, col4, col5 = st.columns(5)
        
        with col1:
            total_revenue = df_sales['purchase_amount'].sum()
            st.metric(
                "Total Revenue",
                format_currency(total_revenue),
                help="Total revenue in the selected period"
            )
        
        with col2:
            discounted_sales = df_sales[df_sales['discount_applied'] == 1]
            discount_revenue = discounted_sales['purchase_amount'].sum()
            st.metric(
                "Discount Revenue",
                format_currency(discount_revenue),
                help="Revenue from discounted transactions"
            )
        
        with col3:
            discount_rate = (len(discounted_sales) / len(df_sales) * 100) if len(df_sales) > 0 else 0
            st.metric(
                "Discount Rate",
                format_percentage(discount_rate),
                help="Percentage of transactions with discounts"
            )
        
        with col4:
            avg_discount_order = discounted_sales['purchase_amount'].mean() if len(discounted_sales) > 0 else 0
            avg_regular_order = df_sales[df_sales['discount_applied'] == 0]['purchase_amount'].mean()
            discount_impact = ((avg_discount_order - avg_regular_order) / avg_regular_order * 100) if avg_regular_order > 0 else 0
            st.metric(
                "Discount Impact",
                format_percentage(discount_impact),
                help="Order value change with discounts",
                delta=format_percentage(discount_impact)
            )
        
        with col5:
            payment_methods = df_sales['payment_method'].nunique()
            st.metric(
                "Payment Methods",
                format_number(payment_methods),
                help="Number of payment methods available"
            )
        
        st.divider()
        
        # =====================================================================
        # DISCOUNT EFFECTIVENESS
        # =====================================================================
        st.header("🎁 Discount & Promotion Effectiveness")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Revenue: Discount vs No Discount
            discount_comparison = df_sales.groupby('discount_applied').agg({
                'purchase_amount': 'sum',
                'transaction_id': 'count'
            }).reset_index()
            discount_comparison['discount_applied'] = discount_comparison['discount_applied'].map({
                0: 'No Discount',
                1: 'With Discount'
            })
            discount_comparison.columns = ['Type', 'Revenue', 'Transactions']
            
            fig_discount = create_bar_chart(
                discount_comparison,
                x='Type',
                y='Revenue',
                title="Revenue: Discount vs No Discount",
                color='Type',
                color_discrete_map={'No Discount': COLORS['primary'], 'With Discount': COLORS['success']}
            )
            st.plotly_chart(fig_discount, use_container_width=True)
        
        with col2:
            # Transaction count comparison
            fig_trans = create_bar_chart(
                discount_comparison,
                x='Type',
                y='Transactions',
                title="Transaction Count: Discount vs No Discount",
                color='Type',
                color_discrete_map={'No Discount': COLORS['primary'], 'With Discount': COLORS['success']}
            )
            st.plotly_chart(fig_trans, use_container_width=True)
        
        # Discount performance metrics
        st.subheader("📊 Discount Performance Comparison")
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric(
                "Avg Order (With Discount)",
                format_currency(avg_discount_order)
            )
        
        with col2:
            st.metric(
                "Avg Order (No Discount)",
                format_currency(avg_regular_order)
            )
        
        with col3:
            discount_transactions = len(discounted_sales)
            st.metric(
                "Discounted Transactions",
                format_number(discount_transactions)
            )
        
        with col4:
            discount_revenue_pct = (discount_revenue / total_revenue * 100) if total_revenue > 0 else 0
            st.metric(
                "Discount Revenue %",
                format_percentage(discount_revenue_pct)
            )
        
        # =====================================================================
        # DISCOUNT BY CATEGORY
        # =====================================================================
        st.subheader("🏷️ Discount Usage by Category")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Categories with highest discount rate
            category_discount = df_sales.groupby('root_category_name').agg({
                'discount_applied': ['sum', 'count'],
                'purchase_amount': 'sum'
            }).reset_index()
            category_discount.columns = ['Category', 'Discounted', 'Total', 'Revenue']
            category_discount['Discount Rate'] = (category_discount['Discounted'] / 
                                                   category_discount['Total'] * 100)
            category_discount = category_discount.sort_values('Discount Rate', ascending=False).head(15)
            
            fig_cat_discount = create_bar_chart(
                category_discount,
                x='Discount Rate',
                y='Category',
                title="Top 15 Categories by Discount Rate",
                orientation='h',
                color_discrete_sequence=[COLORS['warning']]
            )
            st.plotly_chart(fig_cat_discount, use_container_width=True)
        
        with col2:
            # Categories with most discount revenue
            cat_discount_rev = df_sales[df_sales['discount_applied'] == 1].groupby('root_category_name').agg({
                'purchase_amount': 'sum'
            }).reset_index()
            cat_discount_rev = cat_discount_rev.sort_values('purchase_amount', ascending=False).head(15)
            cat_discount_rev.columns = ['Category', 'Revenue']
            
            fig_cat_rev = create_bar_chart(
                cat_discount_rev,
                x='Revenue',
                y='Category',
                title="Top 15 Categories by Discount Revenue",
                orientation='h',
                color_discrete_sequence=[COLORS['success']]
            )
            st.plotly_chart(fig_cat_rev, use_container_width=True)
        
        # =====================================================================
        # PAYMENT METHOD ANALYSIS
        # =====================================================================
        st.header("💳 Payment Method Performance")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Revenue by payment method
            payment_revenue = df_sales.groupby('payment_method').agg({
                'purchase_amount': 'sum',
                'transaction_id': 'count'
            }).reset_index()
            payment_revenue.columns = ['Payment Method', 'Revenue', 'Transactions']
            payment_revenue = payment_revenue.sort_values('Revenue', ascending=False)
            
            fig_payment = create_bar_chart(
                payment_revenue,
                x='Payment Method',
                y='Revenue',
                title="Revenue by Payment Method",
                color_discrete_sequence=[COLORS['primary']]
            )
            st.plotly_chart(fig_payment, use_container_width=True)
        
        with col2:
            # Payment method distribution
            fig_payment_pie = create_pie_chart(
                payment_revenue,
                names='Payment Method',
                values='Transactions',
                title="Transaction Share by Payment Method",
                hole=0.4
            )
            st.plotly_chart(fig_payment_pie, use_container_width=True)
        
        # Payment method metrics table
        st.subheader("📋 Payment Method Details")
        
        payment_details = df_sales.groupby('payment_method').agg({
            'transaction_id': 'count',
            'purchase_amount': ['sum', 'mean'],
            'discount_applied': lambda x: (x == 1).sum(),
            'repeat_customer': lambda x: (x == 1).sum()
        }).reset_index()
        
        payment_details.columns = ['Payment Method', 'Transactions', 'Total Revenue', 
                                   'Avg Order Value', 'Discounted Trans', 'Repeat Customers']
        payment_details = payment_details.sort_values('Total Revenue', ascending=False)
        
        # Calculate additional metrics
        payment_details['Discount Rate'] = (payment_details['Discounted Trans'] / 
                                            payment_details['Transactions'] * 100)
        payment_details['Repeat Rate'] = (payment_details['Repeat Customers'] / 
                                          payment_details['Transactions'] * 100)
        
        # Format columns
        payment_details['Total Revenue'] = payment_details['Total Revenue'].apply(format_currency)
        payment_details['Avg Order Value'] = payment_details['Avg Order Value'].apply(format_currency)
        payment_details['Discount Rate'] = payment_details['Discount Rate'].apply(lambda x: f"{x:.1f}%")
        payment_details['Repeat Rate'] = payment_details['Repeat Rate'].apply(lambda x: f"{x:.1f}%")
        
        st.dataframe(
            payment_details,
            use_container_width=True,
            height=400,
            hide_index=True
        )
        
        # =====================================================================
        # PAYMENT METHOD & DISCOUNT INTERACTION
        # =====================================================================
        st.header("🔄 Payment Method & Discount Interaction")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Discount usage by payment method
            payment_discount = df_sales.groupby(['payment_method', 'discount_applied']).agg({
                'transaction_id': 'count'
            }).reset_index()
            payment_discount['discount_applied'] = payment_discount['discount_applied'].map({
                0: 'No Discount',
                1: 'With Discount'
            })
            
            fig_pay_disc = px.bar(
                payment_discount,
                x='payment_method',
                y='transaction_id',
                color='discount_applied',
                title="Discount Usage by Payment Method",
                labels={'transaction_id': 'Transactions', 'payment_method': 'Payment Method'},
                color_discrete_map={'No Discount': COLORS['primary'], 'With Discount': COLORS['success']},
                barmode='group'
            )
            st.plotly_chart(fig_pay_disc, use_container_width=True)
        
        with col2:
            # Average order value by payment and discount
            payment_discount_aov = df_sales.groupby(['payment_method', 'discount_applied']).agg({
                'purchase_amount': 'mean'
            }).reset_index()
            payment_discount_aov['discount_applied'] = payment_discount_aov['discount_applied'].map({
                0: 'No Discount',
                1: 'With Discount'
            })
            
            fig_aov = px.bar(
                payment_discount_aov,
                x='payment_method',
                y='purchase_amount',
                color='discount_applied',
                title="Average Order Value: Payment Method & Discount",
                labels={'purchase_amount': 'Avg Order Value ($)', 'payment_method': 'Payment Method'},
                color_discrete_map={'No Discount': COLORS['primary'], 'With Discount': COLORS['success']},
                barmode='group'
            )
            st.plotly_chart(fig_aov, use_container_width=True)
        
        # =====================================================================
        # TIME-BASED DISCOUNT ANALYSIS
        # =====================================================================
        st.header("📅 Discount Trends Over Time")
        
        df_sales['full_date'] = pd.to_datetime(df_sales['full_date'])
        
        # Daily discount rate
        daily_discount = df_sales.groupby('full_date').agg({
            'discount_applied': ['sum', 'count'],
            'purchase_amount': 'sum'
        }).reset_index()
        daily_discount.columns = ['Date', 'Discounted', 'Total', 'Revenue']
        daily_discount['Discount Rate'] = (daily_discount['Discounted'] / daily_discount['Total'] * 100)
        
        fig_daily_discount = go.Figure()
        fig_daily_discount.add_trace(go.Scatter(
            x=daily_discount['Date'],
            y=daily_discount['Discount Rate'],
            mode='lines+markers',
            name='Discount Rate',
            line=dict(color=COLORS['warning'], width=2),
            marker=dict(size=4)
        ))
        
        fig_daily_discount.update_layout(
            title="Daily Discount Rate Trend",
            xaxis_title="Date",
            yaxis_title="Discount Rate (%)",
            template='plotly_white',
            hovermode='x unified',
            height=400
        )
        
        st.plotly_chart(fig_daily_discount, use_container_width=True)
        
        # =====================================================================
        # CUSTOMER SEGMENT ANALYSIS
        # =====================================================================
        st.header("👥 Discount Usage by Customer Segments")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Discount by age group
            age_discount = df_sales.groupby(['age_group', 'discount_applied']).agg({
                'transaction_id': 'count'
            }).reset_index()
            age_discount['discount_applied'] = age_discount['discount_applied'].map({
                0: 'No Discount',
                1: 'With Discount'
            })
            
            fig_age_disc = px.bar(
                age_discount,
                x='age_group',
                y='transaction_id',
                color='discount_applied',
                title="Discount Usage by Age Group",
                labels={'transaction_id': 'Transactions', 'age_group': 'Age Group'},
                color_discrete_map={'No Discount': COLORS['info'], 'With Discount': COLORS['danger']},
                barmode='group'
            )
            st.plotly_chart(fig_age_disc, use_container_width=True)
        
        with col2:
            # Discount by gender
            gender_discount = df_sales.groupby(['gender', 'discount_applied']).agg({
                'transaction_id': 'count'
            }).reset_index()
            gender_discount['discount_applied'] = gender_discount['discount_applied'].map({
                0: 'No Discount',
                1: 'With Discount'
            })
            
            fig_gender_disc = px.bar(
                gender_discount,
                x='gender',
                y='transaction_id',
                color='discount_applied',
                title="Discount Usage by Gender",
                labels={'transaction_id': 'Transactions', 'gender': 'Gender'},
                color_discrete_map={'No Discount': COLORS['info'], 'With Discount': COLORS['danger']},
                barmode='group'
            )
            st.plotly_chart(fig_gender_disc, use_container_width=True)
        
        # =====================================================================
        # DOWNLOAD DATA
        # =====================================================================
        st.divider()
        st.subheader("📥 Export Data")
        render_download_buttons(df_sales, "payment_promotion_analysis")


if __name__ == "__main__":
    main()
