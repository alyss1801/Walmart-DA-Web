"""
Build dimension tables for 3 independent Star Schemas.

Star Schema 1 (Retail Sales 2024-2025):
- DIM_PRODUCT, DIM_CUSTOMER, DIM_DATE_RETAIL, DIM_PAYMENT, DIM_CATEGORY

Star Schema 2 (Store Performance 2010-2012):
- DIM_STORE, DIM_DATE_STORE, DIM_TEMPERATURE

Star Schema 3 (E-commerce 2019):
- DIM_ECOMMERCE_PRODUCT, DIM_ECOMMERCE_CATEGORY, DIM_ECOMMERCE_BRAND
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Optional

import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class DimensionBuilder:
    """Create all dimension tables for the star schema."""

    def __init__(self, standardized_dir: Path, output_dir: Path):
        self.std_dir = Path(standardized_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.df_products: Optional[pd.DataFrame] = None
        self.df_purchases: Optional[pd.DataFrame] = None
        self.df_walmart: Optional[pd.DataFrame] = None
        self.df_store_performance: Optional[pd.DataFrame] = None
        self.df_ecommerce_sales: Optional[pd.DataFrame] = None
        self._load_sources()

    def _load_sources(self) -> None:
        """Load standardized inputs."""
        try:
            self.df_products = pd.read_csv(self.std_dir / "product_master.csv")
            logger.info("Loaded product_master.csv (%d rows)", len(self.df_products))
        except Exception as exc:
            logger.warning("Could not load product_master.csv: %s", exc)

        try:
            self.df_purchases = pd.read_csv(self.std_dir / "std_customer_purchases.csv")
            logger.info("Loaded std_customer_purchases.csv (%d rows)", len(self.df_purchases))
        except Exception as exc:
            logger.warning("Could not load std_customer_purchases.csv: %s", exc)

        try:
            self.df_walmart = pd.read_csv(self.std_dir / "std_walmart_products.csv")
            logger.info("Loaded std_walmart_products.csv (%d rows)", len(self.df_walmart))
        except Exception as exc:
            logger.warning("Could not load std_walmart_products.csv: %s", exc)

        try:
            self.df_store_performance = pd.read_csv(self.std_dir / "std_store_performance.csv")
            logger.info("Loaded std_store_performance.csv (%d rows)", len(self.df_store_performance))
        except Exception as exc:
            logger.warning("Could not load std_store_performance.csv: %s", exc)

        try:
            self.df_ecommerce_sales = pd.read_csv(self.std_dir / "std_ecommerce_sales.csv")
            logger.info("Loaded std_ecommerce_sales.csv (%d rows)", len(self.df_ecommerce_sales))
        except Exception as exc:
            logger.warning("Could not load std_ecommerce_sales.csv: %s", exc)

    # ------------------------------------------------------------------ #
    def build_dim_product(self) -> Optional[pd.DataFrame]:
        if self.df_products is None:
            logger.error("product_master.csv is required to build DIM_PRODUCT")
            return None

        dim_product = self.df_products.copy()
        dim_product.insert(0, "product_key", range(1, len(dim_product) + 1))

        # Ensure consistent column order
        wanted = [
            "product_key",
            "product_id",
            "product_name",
            "brand",
            "category_name",
            "root_category_name",
            "rating",
            "review_count",
            "source",
        ]
        dim_product = dim_product.reindex(columns=wanted)

        output_path = self.output_dir / "DIM_PRODUCT.csv"
        dim_product.to_csv(output_path, index=False)
        logger.info("DIM_PRODUCT built -> %s (%d rows)", output_path, len(dim_product))
        return dim_product

    def build_dim_customer(self) -> Optional[pd.DataFrame]:
        if self.df_purchases is None:
            logger.error("std_customer_purchases.csv is required to build DIM_CUSTOMER")
            return None

        cols = ["customer_id", "age", "gender", "city"]
        dim_customer = self.df_purchases[cols].drop_duplicates(subset=["customer_id"]).copy()
        dim_customer.insert(0, "customer_key", range(1, len(dim_customer) + 1))

        dim_customer["age_group"] = pd.cut(
            dim_customer["age"],
            bins=[0, 18, 30, 45, 60, 120],
            labels=["<18", "18-30", "31-45", "46-60", "60+"],
        )

        output_path = self.output_dir / "DIM_CUSTOMER.csv"
        dim_customer.to_csv(output_path, index=False)
        logger.info("DIM_CUSTOMER built -> %s (%d rows)", output_path, len(dim_customer))
        return dim_customer

    def build_dim_date(self) -> pd.DataFrame:
        # Use purchase date range when available; otherwise default 2020-2030.
        start_date = datetime(2020, 1, 1)
        end_date = datetime(2030, 12, 31)

        if self.df_purchases is not None and "purchase_date" in self.df_purchases.columns:
            dates = pd.to_datetime(self.df_purchases["purchase_date"], errors="coerce").dropna()
            if not dates.empty:
                start_date = dates.min().date()
                end_date = dates.max().date()
                # Extend a little for future reporting
                end_date = end_date + timedelta(days=90)
                start_date = start_date - timedelta(days=30)
                start_date = datetime.combine(start_date, datetime.min.time())
                end_date = datetime.combine(end_date, datetime.min.time())

        dates = pd.date_range(start=start_date, end=end_date, freq="D")
        dim_date = pd.DataFrame(
            {
                "date_key": dates.strftime("%Y%m%d").astype(int),
                "full_date": dates.date,
                "day": dates.day,
                "day_name": dates.strftime("%A"),
                "day_of_week": dates.dayofweek + 1,
                "is_weekend": (dates.dayofweek >= 5).astype(int),
                "month": dates.month,
                "month_name": dates.strftime("%B"),
                "quarter": dates.quarter,
                "week_of_year": dates.isocalendar().week.astype(int),
                "year": dates.year,
            }
        )

        output_path = self.output_dir / "DIM_DATE.csv"
        dim_date.to_csv(output_path, index=False)
        logger.info("DIM_DATE built -> %s (%d rows)", output_path, len(dim_date))
        return dim_date

    def build_dim_payment(self) -> Optional[pd.DataFrame]:
        if self.df_purchases is None:
            logger.error("std_customer_purchases.csv is required to build DIM_PAYMENT")
            return None

        methods = self.df_purchases["payment_method"].dropna().unique()
        dim_payment = pd.DataFrame(
            {
                "payment_key": range(1, len(methods) + 1),
                "payment_method": methods,
            }
        )

        output_path = self.output_dir / "DIM_PAYMENT.csv"
        dim_payment.to_csv(output_path, index=False)
        logger.info("DIM_PAYMENT built -> %s (%d rows)", output_path, len(dim_payment))
        return dim_payment

    def build_dim_category(self) -> Optional[pd.DataFrame]:
        """DIM_CATEGORY for Star Schema 1 (Retail Sales)"""
        frames = []

        if self.df_walmart is not None:
            temp = self.df_walmart[["category_name", "root_category_name"]].drop_duplicates()
            frames.append(temp)

        if self.df_purchases is not None:
            temp = (
                self.df_purchases[["category"]]
                .drop_duplicates()
                .rename(columns={"category": "category_name"})
            )
            temp["root_category_name"] = None
            frames.append(temp)

        if not frames:
            logger.error("No category sources found to build DIM_CATEGORY")
            return None

        dim_category = pd.concat(frames, ignore_index=True)
        dim_category = dim_category.drop_duplicates(subset=["category_name"])
        dim_category.insert(0, "category_key", range(1, len(dim_category) + 1))

        output_path = self.output_dir / "DIM_CATEGORY.csv"
        dim_category.to_csv(output_path, index=False)
        logger.info("DIM_CATEGORY built -> %s (%d rows)", output_path, len(dim_category))
        return dim_category

    # ===================================================================
    # STAR SCHEMA 2: Store Performance Dimensions (2010-2012)
    # ===================================================================
    
    def build_dim_store(self) -> Optional[pd.DataFrame]:
        """DIM_STORE for Star Schema 2 (Store Performance)"""
        if self.df_store_performance is None:
            logger.warning("No store performance data found, skipping DIM_STORE")
            return None
        
        stores = self.df_store_performance[["store_id"]].drop_duplicates().copy()
        stores = stores.sort_values("store_id").reset_index(drop=True)
        stores.insert(0, "store_key", range(1, len(stores) + 1))
        stores["store_name"] = "Store " + stores["store_id"].astype(str)
        stores["region"] = "USA"
        
        output_path = self.output_dir / "DIM_STORE.csv"
        stores.to_csv(output_path, index=False)
        logger.info("DIM_STORE built -> %s (%d stores)", output_path, len(stores))
        return stores
    
    def build_dim_date_store(self) -> Optional[pd.DataFrame]:
        """DIM_DATE_STORE for Star Schema 2 (Store Performance 2010-2012)"""
        if self.df_store_performance is None:
            logger.warning("No store performance data, skipping DIM_DATE_STORE")
            return None
        
        dates = pd.to_datetime(self.df_store_performance["sale_date"], errors="coerce").dropna()
        if dates.empty:
            logger.warning("No valid dates found in store performance data")
            return None
        
        start_date = dates.min().date()
        end_date = dates.max().date()
        start_date = datetime.combine(start_date, datetime.min.time())
        end_date = datetime.combine(end_date, datetime.min.time())
        
        dates = pd.date_range(start=start_date, end=end_date, freq="D")
        dim_date = pd.DataFrame({
            "date_key": dates.strftime("%Y%m%d").astype(int),
            "full_date": dates.date,
            "day": dates.day,
            "day_name": dates.strftime("%A"),
            "day_of_week": dates.dayofweek + 1,
            "is_weekend": (dates.dayofweek >= 5).astype(int),
            "month": dates.month,
            "month_name": dates.strftime("%B"),
            "quarter": dates.quarter,
            "week_of_year": dates.isocalendar().week.astype(int),
            "year": dates.year,
        })
        
        output_path = self.output_dir / "DIM_DATE_STORE.csv"
        dim_date.to_csv(output_path, index=False)
        logger.info("DIM_DATE_STORE built -> %s (%d days, %s to %s)", 
                   output_path, len(dim_date), start_date.date(), end_date.date())
        return dim_date
    
    def build_dim_temperature(self) -> pd.DataFrame:
        """DIM_TEMPERATURE for Star Schema 2 (Temperature categories)"""
        dim_temp = pd.DataFrame({
            "temp_category_key": [1, 2, 3, 4, 5],
            "temp_category": ["Freezing", "Cold", "Cool", "Warm", "Hot"],
            "temp_range_min": [-999, 32, 50, 70, 85],
            "temp_range_max": [32, 50, 70, 85, 999],
            "description": [
                "Below 32°F - Freezing conditions",
                "32-50°F - Cold weather",
                "50-70°F - Cool/Comfortable",
                "70-85°F - Warm weather",
                "Above 85°F - Hot conditions"
            ]
        })
        
        output_path = self.output_dir / "DIM_TEMPERATURE.csv"
        dim_temp.to_csv(output_path, index=False)
        logger.info("DIM_TEMPERATURE built -> %s (5 categories)", output_path)
        return dim_temp

    # ===================================================================
    # STAR SCHEMA 3: E-commerce Dimensions (2019)
    # ===================================================================
    
    def build_dim_ecommerce_product(self) -> Optional[pd.DataFrame]:
        """DIM_ECOMMERCE_PRODUCT for Star Schema 3 (E-commerce)"""
        if self.df_ecommerce_sales is None:
            logger.warning("No e-commerce data found, skipping DIM_ECOMMERCE_PRODUCT")
            return None
        
        # Select columns that actually exist in the data
        available_cols = self.df_ecommerce_sales.columns.tolist()
        cols_to_select = []
        
        # Check which columns exist and add them
        for col in ["product_id", "product_name", "brand", "root_category", "sub_category"]:
            if col in available_cols:
                cols_to_select.append(col)
        
        dim = self.df_ecommerce_sales[cols_to_select].drop_duplicates().copy()
        dim.insert(0, "ecommerce_product_key", range(1, len(dim) + 1))
        
        output_path = self.output_dir / "DIM_ECOMMERCE_PRODUCT.csv"
        dim.to_csv(output_path, index=False)
        logger.info("DIM_ECOMMERCE_PRODUCT built -> %s (%d products)", output_path, len(dim))
        return dim
    
    def build_dim_ecommerce_category(self) -> Optional[pd.DataFrame]:
        """DIM_ECOMMERCE_CATEGORY for Star Schema 3"""
        if self.df_ecommerce_sales is None:
            logger.warning("No e-commerce data, skipping DIM_ECOMMERCE_CATEGORY")
            return None
        
        dim = self.df_ecommerce_sales[[
            "root_category", "sub_category"
        ]].drop_duplicates().copy()
        dim.insert(0, "ecommerce_category_key", range(1, len(dim) + 1))
        
        output_path = self.output_dir / "DIM_ECOMMERCE_CATEGORY.csv"
        dim.to_csv(output_path, index=False)
        logger.info("DIM_ECOMMERCE_CATEGORY built -> %s (%d categories)", output_path, len(dim))
        return dim
    
    def build_dim_ecommerce_brand(self) -> Optional[pd.DataFrame]:
        """DIM_ECOMMERCE_BRAND for Star Schema 3"""
        if self.df_ecommerce_sales is None:
            logger.warning("No e-commerce data, skipping DIM_ECOMMERCE_BRAND")
            return None
        
        brands = self.df_ecommerce_sales[["brand"]].drop_duplicates().dropna()
        brands = brands.sort_values("brand").reset_index(drop=True)
        brands.insert(0, "brand_key", range(1, len(brands) + 1))
        
        output_path = self.output_dir / "DIM_ECOMMERCE_BRAND.csv"
        brands.to_csv(output_path, index=False)
        logger.info("DIM_ECOMMERCE_BRAND built -> %s (%d brands)", output_path, len(brands))
        return brands

    def build_all(self) -> Dict[str, Optional[pd.DataFrame]]:
        logger.info("=" * 80)
        logger.info("BUILDING DIMENSIONS FOR 3 STAR SCHEMAS")
        logger.info("=" * 80)

        dims: Dict[str, Optional[pd.DataFrame]] = {
            # Star Schema 1: Retail Sales (2024-2025)
            "product": self.build_dim_product(),
            "customer": self.build_dim_customer(),
            "date": self.build_dim_date(),
            "payment": self.build_dim_payment(),
            "category": self.build_dim_category(),
            
            # Star Schema 2: Store Performance (2010-2012)
            "store": self.build_dim_store(),
            "date_store": self.build_dim_date_store(),
            "temperature": self.build_dim_temperature(),
            
            # Star Schema 3: E-commerce (2019)
            "ecommerce_product": self.build_dim_ecommerce_product(),
            "ecommerce_category": self.build_dim_ecommerce_category(),
            "ecommerce_brand": self.build_dim_ecommerce_brand(),
        }

        logger.info("=" * 80)
        logger.info("DIMENSIONS COMPLETE FOR ALL 3 STAR SCHEMAS")
        logger.info("=" * 80)
        return dims


def main():
    base_dir = Path(__file__).resolve().parents[2]
    std_dir = base_dir / "data" / "Golden" / "standardized"
    output_dir = base_dir / "data" / "Golden" / "dimensions"

    DimensionBuilder(std_dir, output_dir).build_all()


if __name__ == "__main__":
    main()
