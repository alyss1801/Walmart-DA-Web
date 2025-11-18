DA/
├── requirement.txt
├── data/
│   ├── Raw/                   # Chứa các file CSV đầu vào (Marketing, Products, Purchases...)
│   └── Clean/                 # Chứa các file CSV sau khi làm sạch (Lưu tự động)
├── staging/
│   └── staging.db             # DuckDB Database (Kho dữ liệu đích)
└── ETL/
    ├── extracting.py          # Module đọc file an toàn (xử lý encoding)
    ├── transforming.py        # Module làm sạch, xử lý missing, outliers, feature engineering
    ├── loading.py             # Module tải dữ liệu vào DuckDB (Upsert/Append)
    └── run.py                 # File chạy chính (Orchestrator)

🚀 Tính năng nổi bật
1. Robust Extraction (Trích xuất mạnh mẽ)
- Tự động phát hiện encoding của file CSV bằng charset-normalizer.
- Cơ chế Fallback thông minh: Thử hàng loạt encoding (UTF-8, CP1252, Shift-JIS...) và tự động chuyển về latin1 + fix unicode nếu thất bại. Đảm bảo không bao giờ crash khi đọc file.
2. Advanced Transformation (Chuyển đổi nâng cao)
- Smart Imputation: Điền dữ liệu thiếu dựa trên tỷ lệ % missing:
    + < 5%: Dùng thuật toán KNN (K-Nearest Neighbors).
    + 5% - 30%: Dùng MICE (Iterative Imputer).
    + > 30%: Dùng Median.
- Outlier Handling: Phát hiện và xử lý ngoại lai bằng phương pháp IQR (Winsorization hoặc Capping).
- Feature Engineering: Tự động tạo các cột mới (price_range, rating_quality, review_density...).
3. Flexible Loading (Tải linh hoạt)
- Hỗ trợ Upsert (Cập nhật dòng cũ, chèn dòng mới) dựa trên Primary Key.
- Hỗ trợ Append (Chèn thêm) hoặc Overwrite (Ghi đè toàn bộ).
- Tích hợp DuckDB cho tốc độ truy vấn cao.

🛠️ Cài đặt
1. Clone dự án về máy: 
    git clone <link-repo-cua-ban>
    cd DA
2. Cài đặt thư viện:
    pip install -r ETL/requirements.txt

▶️ Cách chạy
    cd ETL
    python run.py

Sau khi chạy xong:
- File sạch sẽ được lưu tại ../data/Clean/.
- Dữ liệu được nạp vào ../staging/staging.db.
- Log chi tiết quá trình chạy sẽ hiện trên màn hình.

⚙️ Cấu hình (Configuration)
Bạn có thể thay đổi các cài đặt trong file run.py:
- SOURCE_DIR: Đường dẫn folder chứa file Raw.
- DATABASE_PATH: Đường dẫn file database DuckDB.
- OVERWRITE_TABLES: Set True nếu muốn xóa bảng cũ và tạo lại mới mỗi lần chạy.
- DEFAULT_PRIMARY_KEYS: Định nghĩa khóa chính cho từng bảng để thực hiện Upsert.