import duckdb
import pandas as pd
from charset_normalizer import from_path
import glob
import logging
import os
import re

SOURCE_DIR = 'data/'  # Thư mục chứa file CSV
DATABASE_PATH = './staging/staging.db'     # File path DuckDB cho staging (có thể dùng ':memory:' cho in-memory)
OVERWRITE_TABLES = False

# Cấu hình logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

def safe_read_csv(file_path, **kwargs):
    """
    Đọc CSV an toàn 100% với bất kỳ encoding nào.
    Trả về DataFrame hoặc raise lỗi rõ ràng.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File không tồn tại: {file_path}")

    # 1. Phát hiện encoding chính xác bằng charset-normalizer
    try:
        detection = from_path(file_path, cp_isolation=None)  # Không giới hạn
        best = detection.best()
        if not best:
            raise ValueError("Không phát hiện được encoding")
        detected_encoding = best.encoding
        confidence = best.confidence  # Độ tin cậy (0.0 - 1.0)
        logger.info(f"Phát hiện encoding: {detected_encoding} (độ tin cậy: {confidence:.2f}) cho file: {file_path}")
    except Exception as e:
        logger.warning(f"Không thể phát hiện encoding tự động: {e}. Dùng fallback.")
        detected_encoding = None

    # 2. Danh sách encoding ưu tiên thử (rất rộng)
    encodings_to_try = [
        detected_encoding,           # Ưu tiên phát hiện tự động
        'utf-8', 'utf-8-sig',
        'cp1252', 'windows-1252',
        'latin1', 'iso-8859-1',
        'cp1250', 'cp1251', 'cp1253', 'cp1254', 'cp1255', 'cp1256',
        'gb2312', 'gbk', 'big5',
        'shift-jis', 'euc-jp', 'euc-kr',
        'ascii'
    ]
    # Loại bỏ None và trùng lặp
    encodings_to_try = list(dict.fromkeys([e for e in encodings_to_try if e]))

    # 3. Thử đọc với từng encoding
    for enc in encodings_to_try:
        try:
            df = pd.read_csv(file_path, encoding=enc, low_memory=False, **kwargs)
            logger.info(f"Đọc thành công với encoding: {enc}")
            return df
        except UnicodeDecodeError:
            logger.debug(f"Thất bại với encoding: {enc}")
            continue
        except Exception as e:
            logger.debug(f"Lỗi khác với {enc}: {e}")
            continue

    # 4. Fallback cuối cùng: Đọc bằng 'latin1' (đọc được mọi byte, không crash)
    logger.warning(f"Dùng fallback 'latin1' cho file: {file_path}")
    try:
        df = pd.read_csv(file_path, encoding='latin1', low_memory=False, **kwargs)
        # Cố gắng chuyển về UTF-8 nếu có thể
        df = df.apply(lambda x: x.str.encode('latin1').str.decode('utf-8', errors='replace') if x.dtype == "object" else x)
        return df
    except Exception as e:
        raise RuntimeError(f"Không thể đọc file dù đã thử mọi cách: {file_path} | Lỗi: {e}")
    
def extract_csv(file_path):
    """Extract: Đọc dữ liệu từ một file CSV."""
    return safe_read_csv(file_path)

def run_etl():
    conn = duckdb.connect(database=DATABASE_PATH)
    try:
        csv_files = glob.glob(os.path.join(SOURCE_DIR, '*.csv'))
        if not csv_files:
            raise ValueError("No csv files found.")
        
        for file_path in csv_files:
            file_name = os.path.basename(file_path).split('.')[0]
            df = extract_csv(file_path)

            table_name = re.sub(r"[^0-9a-zA-Z_]", "_", file_name)
            if re.match(r"^[0-9]", table_name):
                table_name = "t_" + table_name

            print(f"ETLing file {file_path} -> table: {table_name}")

            # Xoá bảng nếu đã tồn tại và overwrite được bật
            if OVERWRITE_TABLES:
                conn.execute(f"DROP TABLE IF EXISTS {table_name}")

            # Load dữ liệu vào DuckDB
            try:
                conn.register('tmp_df', df)
                conn.execute(f"CREATE TABLE IF NOT EXISTS {table_name} AS SELECT * FROM tmp_df")
                # Unregister tạm thời để tránh xung đột tên trong vòng lặp tiếp theo
                try:
                    conn.unregister('tmp_df')
                except Exception:
                    pass
            except Exception as e:
                logger.error(f"Failed to write table {table_name} from {file_path}: {e}")
                raise
    except Exception as e:
        print(f"Error during ETL: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    run_etl()