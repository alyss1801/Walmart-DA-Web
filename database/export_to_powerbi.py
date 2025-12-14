"""
Export DuckDB tables to Power BI
Chạy script này để export all tables sang format Power BI có thể đọc
"""

import duckdb
import pandas as pd
from pathlib import Path

# Paths
DB_PATH = r"D:\DA_pipeline\DA\database\walmart_analytics.db"
EXPORT_DIR = Path(r"D:\DA_pipeline\DA\database\powerbi_export")
EXPORT_DIR.mkdir(exist_ok=True)

def export_all_tables():
    """Export all tables from DuckDB to Parquet (optimal for Power BI)"""
    
    conn = duckdb.connect(DB_PATH, read_only=True)
    
    # Get all table names
    tables = conn.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'main'
    """).fetchall()
    
    print(f"📊 Exporting {len(tables)} tables to Power BI format...\n")
    
    for (table_name,) in tables:
        print(f"Exporting {table_name}...")
        
        # Query table
        df = conn.execute(f"SELECT * FROM {table_name}").fetchdf()
        
        # Export to Parquet (nhanh hơn CSV, Power BI support tốt)
        output_path = EXPORT_DIR / f"{table_name}.parquet"
        df.to_parquet(output_path, index=False, engine='pyarrow')
        
        print(f"  ✅ {table_name}: {len(df):,} rows → {output_path.name}")
    
    conn.close()
    
    print(f"\n🎉 Export hoàn tất! Files tại: {EXPORT_DIR}")
    print(f"\n📋 Import vào Power BI:")
    print(f"   1. Get Data → More → Parquet")
    print(f"   2. Chọn folder: {EXPORT_DIR}")
    print(f"   3. Combine & Transform → Load")

def export_to_csv():
    """Alternative: Export to CSV nếu Parquet không work"""
    
    conn = duckdb.connect(DB_PATH, read_only=True)
    
    tables = conn.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'main'
    """).fetchall()
    
    csv_dir = EXPORT_DIR / "csv"
    csv_dir.mkdir(exist_ok=True)
    
    print(f"📊 Exporting to CSV format...\n")
    
    for (table_name,) in tables:
        print(f"Exporting {table_name}...")
        df = conn.execute(f"SELECT * FROM {table_name}").fetchdf()
        output_path = csv_dir / f"{table_name}.csv"
        df.to_csv(output_path, index=False, encoding='utf-8-sig')
        print(f"  ✅ {table_name}: {len(df):,} rows")
    
    conn.close()
    print(f"\n🎉 CSV Export hoàn tất! Files tại: {csv_dir}")

if __name__ == "__main__":
    # Chọn format export
    print("Chọn format export:")
    print("1. Parquet (khuyên dùng - nhanh hơn)")
    print("2. CSV (backup option)")
    
    choice = input("\nNhập 1 hoặc 2 [1]: ").strip() or "1"
    
    if choice == "1":
        export_all_tables()
    else:
        export_to_csv()
