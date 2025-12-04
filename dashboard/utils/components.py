"""
Shared components for the dashboard
"""

import streamlit as st
from datetime import datetime, timedelta
from typing import Dict, List, Optional


def render_sidebar_filters(filter_options: dict) -> dict:
    """Render common filters in the sidebar and return selected values."""
    st.sidebar.header("🔍 Filters")
    
    # Date range filter
    st.sidebar.subheader("Date Range")
    date_range = filter_options.get('date_range', {})
    min_date = pd.to_datetime(date_range.get('min_date', '2024-01-01'))
    max_date = pd.to_datetime(date_range.get('max_date', datetime.now()))
    
    col1, col2 = st.sidebar.columns(2)
    with col1:
        start_date = st.date_input(
            "Start Date",
            value=min_date,
            min_value=min_date,
            max_value=max_date,
        )
    with col2:
        end_date = st.date_input(
            "End Date",
            value=max_date,
            min_value=min_date,
            max_value=max_date,
        )
    
    # Category filter
    st.sidebar.subheader("Categories")
    categories = st.sidebar.multiselect(
        "Select Categories",
        options=filter_options.get('categories', []),
        default=None,
        placeholder="All Categories"
    )
    
    # Age group filter
    st.sidebar.subheader("Customer Demographics")
    age_groups = st.sidebar.multiselect(
        "Age Groups",
        options=filter_options.get('age_groups', []),
        default=None,
        placeholder="All Age Groups"
    )
    
    genders = st.sidebar.multiselect(
        "Gender",
        options=filter_options.get('genders', []),
        default=None,
        placeholder="All Genders"
    )
    
    # Payment method filter
    st.sidebar.subheader("Payment Methods")
    payment_methods = st.sidebar.multiselect(
        "Select Payment Methods",
        options=filter_options.get('payment_methods', []),
        default=None,
        placeholder="All Payment Methods"
    )
    
    # Apply filters button
    st.sidebar.divider()
    apply_filters = st.sidebar.button("🔄 Apply Filters", use_container_width=True, type="primary")
    reset_filters = st.sidebar.button("↺ Reset Filters", use_container_width=True)
    
    if reset_filters:
        st.rerun()
    
    return {
        'start_date': start_date.strftime('%Y-%m-%d') if start_date else None,
        'end_date': end_date.strftime('%Y-%m-%d') if end_date else None,
        'categories': categories if categories else None,
        'age_groups': age_groups if age_groups else None,
        'genders': genders if genders else None,
        'payment_methods': payment_methods if payment_methods else None,
        'apply_filters': apply_filters,
    }


def render_metric_card(title: str, value: str, delta: Optional[str] = None, 
                      delta_color: str = "normal"):
    """Render a metric card."""
    st.metric(label=title, value=value, delta=delta, delta_color=delta_color)


def render_download_buttons(df, filename_prefix: str):
    """Render download buttons for data export."""
    col1, col2, col3 = st.columns(3)
    
    with col1:
        csv = df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download CSV",
            data=csv,
            file_name=f"{filename_prefix}_{datetime.now().strftime('%Y%m%d')}.csv",
            mime="text/csv",
        )
    
    with col2:
        excel_buffer = BytesIO()
        df.to_excel(excel_buffer, index=False, engine='openpyxl')
        st.download_button(
            label="📥 Download Excel",
            data=excel_buffer.getvalue(),
            file_name=f"{filename_prefix}_{datetime.now().strftime('%Y%m%d')}.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )


def show_info_box(message: str, type: str = "info"):
    """Display an info box."""
    if type == "info":
        st.info(message)
    elif type == "success":
        st.success(message)
    elif type == "warning":
        st.warning(message)
    elif type == "error":
        st.error(message)


import pandas as pd
from io import BytesIO
