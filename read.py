import duckdb
import pandas as pd

db_path = './staging/staging.db'  # Đường dẫn tới database DuckDB đã tạo trong quá trình ETL
conn = duckdb.connect(database=db_path, read_only=True)

try:
    # BƯỚC 1: Xem tất cả bảng có trong database
    tables = conn.execute("SHOW TABLES").fetchdf()
    print("\nCác bảng trong database:")
    print(tables)

    if tables.empty:
        print("Không có bảng nào! Chạy ETL trước.")
    else:
        # BƯỚC 2: Chọn 1 bảng để đọc (ví dụ: bảng đầu tiên)
        for i in range(len(tables)):
            table_name = tables.iloc[i]['name']
            print(f"\nĐọc bảng: {table_name}")

            # Đọc 5 dòng đầu
            df = conn.execute(f"SELECT * FROM {table_name} LIMIT 5").fetchdf()
            print(df)

finally:
    conn.close()