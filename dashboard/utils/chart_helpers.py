"""
Chart helper functions for creating consistent visualizations
"""

import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
from typing import Optional


def create_line_chart(df: pd.DataFrame, x: str, y: str, title: str, 
                     color: Optional[str] = None, **kwargs) -> go.Figure:
    """Create a line chart with consistent styling."""
    fig = px.line(df, x=x, y=y, color=color, title=title, **kwargs)
    fig.update_layout(
        hovermode='x unified',
        template='plotly_white',
        title_font_size=18,
        showlegend=True if color else False,
    )
    return fig


def create_bar_chart(df: pd.DataFrame, x: str, y: str, title: str,
                    color: Optional[str] = None, orientation: str = 'v', **kwargs) -> go.Figure:
    """Create a bar chart with consistent styling."""
    fig = px.bar(df, x=x, y=y, color=color, title=title, 
                orientation=orientation, **kwargs)
    fig.update_layout(
        template='plotly_white',
        title_font_size=18,
        showlegend=True if color else False,
    )
    return fig


def create_pie_chart(df: pd.DataFrame, names: str, values: str, title: str, **kwargs) -> go.Figure:
    """Create a pie chart with consistent styling."""
    fig = px.pie(df, names=names, values=values, title=title, **kwargs)
    fig.update_layout(
        template='plotly_white',
        title_font_size=18,
    )
    fig.update_traces(textposition='inside', textinfo='percent+label')
    return fig


def create_scatter_chart(df: pd.DataFrame, x: str, y: str, title: str,
                        color: Optional[str] = None, size: Optional[str] = None, **kwargs) -> go.Figure:
    """Create a scatter chart with consistent styling."""
    fig = px.scatter(df, x=x, y=y, color=color, size=size, title=title, **kwargs)
    fig.update_layout(
        template='plotly_white',
        title_font_size=18,
    )
    return fig


def create_box_chart(df: pd.DataFrame, x: str, y: str, title: str, **kwargs) -> go.Figure:
    """Create a box plot with consistent styling."""
    fig = px.box(df, x=x, y=y, title=title, **kwargs)
    fig.update_layout(
        template='plotly_white',
        title_font_size=18,
    )
    return fig


def create_heatmap(df: pd.DataFrame, x: str, y: str, z: str, title: str, **kwargs) -> go.Figure:
    """Create a heatmap with consistent styling."""
    pivot_df = df.pivot_table(values=z, index=y, columns=x, aggfunc='sum')
    fig = go.Figure(data=go.Heatmap(
        z=pivot_df.values,
        x=pivot_df.columns,
        y=pivot_df.index,
        colorscale='Blues',
        **kwargs
    ))
    fig.update_layout(
        title=title,
        template='plotly_white',
        title_font_size=18,
    )
    return fig


def create_metric_cards(metrics: dict) -> str:
    """Create HTML for metric cards."""
    cards_html = '<div style="display: flex; gap: 20px; flex-wrap: wrap;">'
    
    for title, value in metrics.items():
        cards_html += f"""
        <div style="
            flex: 1;
            min-width: 200px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            color: white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        ">
            <h3 style="margin: 0; font-size: 14px; opacity: 0.9;">{title}</h3>
            <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">{value}</p>
        </div>
        """
    
    cards_html += '</div>'
    return cards_html


def format_currency(value: float) -> str:
    """Format value as currency."""
    return f"${value:,.2f}"


def format_number(value: float, decimals: int = 0) -> str:
    """Format number with thousands separator."""
    return f"{value:,.{decimals}f}"


def format_percentage(value: float) -> str:
    """Format value as percentage."""
    return f"{value:.1f}%"
