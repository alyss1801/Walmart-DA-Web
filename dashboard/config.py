"""
Configuration settings for Walmart Analytics Dashboard
"""

from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = BASE_DIR / "database" / "walmart_analytics.db"
DATA_GOLDEN_DIR = BASE_DIR / "data" / "Golden"

# Dashboard settings
APP_TITLE = "Walmart Analytics Dashboard"
PAGE_ICON = "🛒"
LAYOUT = "wide"

# Color palette
COLORS = {
    "primary": "#0071CE",  # Walmart blue
    "secondary": "#FFC220",  # Walmart yellow
    "success": "#00A652",
    "danger": "#DC3545",
    "info": "#17A2B8",
    "warning": "#FFC107",
    "dark": "#343A40",
    "light": "#F8F9FA",
}

# Chart templates
PLOTLY_TEMPLATE = "plotly_white"

# Date format
DATE_FORMAT = "%Y-%m-%d"
