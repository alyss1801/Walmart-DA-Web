"""
Database connector for DuckDB warehouse
"""

import duckdb
import pandas as pd
from pathlib import Path
from typing import Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseConnector:
    """Handle all database operations for the dashboard."""
    
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self.conn: Optional[duckdb.DuckDBPyConnection] = None
        
    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()
        
    def connect(self) -> None:
        """Establish connection to DuckDB."""
        try:
            self.conn = duckdb.connect(str(self.db_path), read_only=True)
            logger.info(f"Connected to database: {self.db_path}")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
            
    def close(self) -> None:
        """Close database connection."""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")
            
    def execute_query(self, query: str) -> pd.DataFrame:
        """Execute a SQL query and return results as DataFrame."""
        if not self.conn:
            raise RuntimeError("Database connection not established")
        
        try:
            result = self.conn.execute(query).fetchdf()
            return result
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            logger.error(f"Query: {query}")
            raise
            
    def get_fact_sales(self, filters: Optional[dict] = None) -> pd.DataFrame:
        """Get FACT_SALES with all dimension joins."""
        query = """
        SELECT 
            f.transaction_id,
            d.full_date,
            d.year,
            d.quarter,
            d.month,
            d.month_name,
            d.day_of_week,
            c.customer_id,
            c.age,
            c.gender,
            c.city,
            c.age_group,
            p.product_id,
            p.product_name,
            p.brand,
            p.category_name,
            p.root_category_name,
            p.rating as product_rating,
            p.review_count,
            cat.category_name as category,
            cat.root_category_name as root_category,
            pay.payment_method,
            f.purchase_amount,
            f.discount_applied,
            f.rating as transaction_rating,
            f.repeat_customer
        FROM FACT_SALES f
        LEFT JOIN DIM_DATE d ON f.date_key = d.date_key
        LEFT JOIN DIM_CUSTOMER c ON f.customer_key = c.customer_key
        LEFT JOIN DIM_PRODUCT p ON f.product_key = p.product_key
        LEFT JOIN DIM_CATEGORY cat ON f.category_key = cat.category_key
        LEFT JOIN DIM_PAYMENT pay ON f.payment_key = pay.payment_key
        """
        
        # Apply filters
        where_clauses = []
        if filters:
            if filters.get('start_date'):
                where_clauses.append(f"d.full_date >= '{filters['start_date']}'")
            if filters.get('end_date'):
                where_clauses.append(f"d.full_date <= '{filters['end_date']}'")
            if filters.get('categories'):
                cats = "','".join(filters['categories'])
                where_clauses.append(f"cat.root_category_name IN ('{cats}')")
            if filters.get('age_groups'):
                ages = "','".join(filters['age_groups'])
                where_clauses.append(f"c.age_group IN ('{ages}')")
            if filters.get('genders'):
                genders = "','".join(filters['genders'])
                where_clauses.append(f"c.gender IN ('{genders}')")
            if filters.get('payment_methods'):
                pays = "','".join(filters['payment_methods'])
                where_clauses.append(f"pay.payment_method IN ('{pays}')")
                
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
            
        return self.execute_query(query)
        
    def get_dimensions(self) -> dict:
        """Get all dimension tables."""
        return {
            'products': self.execute_query("SELECT * FROM DIM_PRODUCT"),
            'customers': self.execute_query("SELECT * FROM DIM_CUSTOMER"),
            'categories': self.execute_query("SELECT * FROM DIM_CATEGORY"),
            'dates': self.execute_query("SELECT * FROM DIM_DATE"),
            'payments': self.execute_query("SELECT * FROM DIM_PAYMENT"),
        }
        
    def get_filter_options(self) -> dict:
        """Get unique values for filter dropdowns."""
        return {
            'categories': self.execute_query(
                "SELECT DISTINCT root_category_name FROM DIM_CATEGORY WHERE root_category_name IS NOT NULL ORDER BY root_category_name"
            )['root_category_name'].tolist(),
            'age_groups': self.execute_query(
                "SELECT DISTINCT age_group FROM DIM_CUSTOMER WHERE age_group IS NOT NULL ORDER BY age_group"
            )['age_group'].tolist(),
            'genders': self.execute_query(
                "SELECT DISTINCT gender FROM DIM_CUSTOMER WHERE gender IS NOT NULL ORDER BY gender"
            )['gender'].tolist(),
            'payment_methods': self.execute_query(
                "SELECT DISTINCT payment_method FROM DIM_PAYMENT WHERE payment_method IS NOT NULL ORDER BY payment_method"
            )['payment_method'].tolist(),
            'date_range': self.execute_query(
                "SELECT MIN(full_date) as min_date, MAX(full_date) as max_date FROM DIM_DATE"
            ).iloc[0].to_dict(),
        }
