"""
===================================================================
TIỀN XỬ LÍ DỮ LIỆU MARKETING - PHIÊN BẢN HOÀN CHỈNH
===================================================================
Kết hợp:
1. Fix cấu trúc CSV (29 cột data → 28 cột header)
2. Tiền xử lí dữ liệu đỉnh cao với ML algorithms
   - KNN Imputation (<5% missing)
   - Iterative Imputation/MICE (5-30% missing)
   - Median/Mode (>30% missing)
   - IQR Outlier Detection & Handling
   - Text Cleaning & Normalization
   - Feature Engineering
===================================================================
"""

import pandas as pd
import numpy as np
import csv
import json
import re
from datetime import datetime
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import KNNImputer, IterativeImputer
import logging
import os
from charset_normalizer import from_path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== BƯỚC 1: FIX CẤU TRÚC CSV ====================
def safe_read_walmart(file_path):
    """Try several encodings and parser fallbacks to read a messy CSV.

    Returns a DataFrame or raises a RuntimeError with a helpful message.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File does not exist: {file_path}")

    # Try to detect encoding first
    detected = None
    try:
        det = from_path(file_path)
        best = det.best()
        if best:
            detected = best.encoding
    except Exception:
        detected = None

    encodings_to_try = [
        detected,
        'utf-8', 'utf-8-sig',
        'cp1252', 'windows-1252',
        'latin1', 'iso-8859-1',
    ]
    encodings_to_try = [e for e in dict.fromkeys(encodings_to_try) if e]

    # Try reading with the fast C engine first, then fallback to python engine
    last_err = None
    for enc in encodings_to_try:
        try:
            df = pd.read_csv(file_path, encoding=enc, low_memory=False)
            logger.info(f"Read success with encoding={enc} (C engine)")
            return df
        except UnicodeDecodeError as e:
            last_err = e
            # try next encoding
            continue
        except pd.errors.ParserError as e:
            # Tokenization/parsing error with C engine — try python engine with permissive on_bad_lines
            try:
                df = pd.read_csv(file_path, encoding=enc, engine='python', on_bad_lines='warn')
                logger.info(f"Read success with encoding={enc} (python engine, on_bad_lines=warn)")
                return df
            except Exception as e2:
                last_err = e2
                continue
        except Exception as e:
            last_err = e
            continue

    # Final fallback: latin1 + python engine (will not fail on byte values but may produce mangled text)
    try:
        df = pd.read_csv(file_path, encoding='latin1', engine='python', on_bad_lines='warn')
        logger.info("Read success with fallback encoding=latin1 (python engine)")
        # try to coerce text columns back to utf-8 where possible
        for col in df.select_dtypes(include=['object']).columns:
            try:
                df[col] = df[col].astype(str).apply(lambda s: s.encode('latin1').decode('utf-8', errors='replace'))
            except Exception:
                pass
        return df
    except Exception as e:
        raise RuntimeError(f"Cannot read file despite fallbacks: {file_path} | Last error: {last_err or e}")

# ==================== BƯỚC 2: Tiền xử lý ====================
def transform(df):

    # Parse numeric columns
    logger.info("🔢 BƯỚC 2: Tiền xử lý...")
    numeric_columns = {
    'Price': 'Price',
    'Monthly Price': 'Monthly Price', 
    'Num Of Reviews': 'Num Of Reviews',
    'Average Rating': 'Average Rating',
    'Number Of Ratings': 'Number Of Ratings',
    'Five Star': 'Five Star',
    'Four Star': 'Four Star',
    'Three Star': 'Three Star',
    'Two Star': 'Two Star',
    'One Star': 'One Star'
    }
    for col in numeric_columns:
        if col in df.columns:
            df[col] = df[col].apply(parse_numeric)
            null_pct = df[col].isna().sum() / len(df) * 100
            logger.info(f"   ✅ {col}: {df[col].notna().sum():,} values ({100-null_pct:.2f}% complete)")
    
    # Clean text columns
    text_columns = ['Title', 'Manufacturer', 'Model Name', 'Carrier', 'Color Category', 'Internal Memory', 'Screen Size', 'Specifications']
    for col in text_columns:
        if col in df.columns:
            df[col] = df[col].apply(clean_text)
    logger.info(f"✅ Làm sạch {len([c for c in text_columns if c in df.columns])} cột text")
    
    # Parse boolean columns
    bool_map = {
        'true': True, 'True': True, 'TRUE': True, True: True, 't': True, 'T': True, '1': True,
        'false': False, 'False': False, 'FALSE': False, False: False, 'f': False, 'F': False, '0': False
    }
    bool_columns = ['Stock', 'Discontinued', 'Broken Link']
    for col in bool_columns:
        if col in df.columns:
            df[col] = df[col].map(bool_map)
            df[col] = df[col].fillna(False).astype(bool)

    # Parse Datetime columns
    if 'Crawl Timestamp' in df.columns:
        time_format = '%Y-%m-%d %H:%M:%S %z'
        df['Crawl Timestamp'] = pd.to_datetime(df['Crawl Timestamp'], format=time_format, errors='coerce')
        df['crawl_year'] = df['Crawl Timestamp'].dt.year
        df['crawl_month'] = df['Crawl Timestamp'].dt.month
        df['crawl_day'] = df['Crawl Timestamp'].dt.day
        df['crawl_dayofweek'] = df['Crawl Timestamp'].dt.dayofweek
    logger.info("✅ Parse boolean & datetime hoàn thành")

    # Xử lý Missing values
    numeric_cols_to_check = ['Price', 'Monthly Price', 'Average Rating', 'Num Of Reviews', 
                'Number Of Ratings', 'Five Star', 'Four Star', 'Three Star', 
                'Two Star', 'One Star']
    df = process_missing_values(df, numeric_cols_to_check)
    logger.info("✅ Process missing values hoàn thành")
    
    # Xử lý Outliers
    outlier_cols = ['Price', 'Monthly Price', 'Average Rating', 'Num Of Reviews', 'Number Of Ratings']
    df = detect_and_handle_outliers(df, outlier_cols)
    logger.info("✅ Detect and handle outliers hoàn thành")

    # Xây dựng Features
    df = feature_engineering(df)
    logger.info("✅ Feature engineering hoàn thành")

    # Xử lý low_value columns
    df = drop_low_value_columns(df)
    logger.info("✅ Drop low value columns hoàn thành")

    # Normalize column names
    df = normalize_column_names(df)
    logger.info("✅ Normalize column names hoàn thành")

    return df

def parse_numeric(value):
    """Parse a single value into float, handling common NA markers and currency/commas."""
    try:
        if pd.isna(value):
            return np.nan
        sval = str(value).strip()
        if sval.lower() in ['na', 'n/a', 'null', 'none', '']:
            return np.nan
        # Remove currency symbols and thousands separators, keep minus and dot
        cleaned = re.sub(r"[^0-9\-\.]", "", sval)
        if cleaned in ['', '-', '.']:
            return np.nan
        return float(cleaned)
    except Exception:
        return np.nan

def clean_text(text):
    """Làm sạch text: normalize whitespace, handle NA"""
    if pd.isna(text) or text in ['NA', 'na', 'N/A', '', 'NULL', 'null']:
        return 'Unknown'
    
    text = str(text).strip()
    
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters ở đầu/cuối
    text = re.sub(r'^[^\w]+|[^\w]+$', '', text)
    
    return text if text else 'Unknown'

def process_missing_values(df, numeric_cols_to_check):
    # Xác định cột cần impute (numeric columns với 0-95% missing)
    impute_cols = []
    for col in numeric_cols_to_check:
        if col in df.columns:
            missing_pct = df[col].isna().sum() / len(df) * 100
            if 0 < missing_pct < 95:
                impute_cols.append(col)

    if impute_cols:
        df = smart_impute_numeric(df, impute_cols)

    return df

def smart_impute_numeric(df, columns):
    """
    Impute numeric columns với strategy thông minh:
    - <5% missing: KNN Imputation
    - 5-30% missing: Iterative Imputation (MICE)
    - >30% missing: Median Imputation
    """
    df_result = df.copy()
    
    cols_to_knn = []
    cols_to_mice = []
    cols_to_median = []
    
    for col in columns:
        if col in df_result.columns:
            missing_pct = df[col].isna().sum() / len(df) * 100
            if 0 < missing_pct < 5:
                cols_to_knn.append(col)
            elif 5 <= missing_pct < 30:
                cols_to_mice.append(col)
            elif missing_pct >= 30:
                cols_to_median.append(col)
        
    if cols_to_knn:
        # KNN Imputation
        # Tìm các cột tương quan để làm features
        try:
            imputer_knn = KNNImputer(n_neighbors=5, weights='distance')
            df_result[cols_to_knn] = imputer_knn.fit_transform(df_result[cols_to_knn])
        except ValueError as e:
            cols_to_median.extend(cols_to_knn)
        
    if cols_to_mice:
        # Iterative Imputation (MICE)            
        try:
            imputer = IterativeImputer(max_iter=10, random_state=42)
            df_result[cols_to_mice] = imputer.fit_transform(df_result[cols_to_mice])
        except ValueError as e:
            cols_to_median.extend(cols_to_mice)
            
    if cols_to_median:
        # Median Imputation
        for col in cols_to_median:
            median_val = df[col].median()
            if pd.isna(median_val):
                median_val = 0
            df_result[col] = df_result[col].fillna(median_val)

    return df_result

def detect_and_handle_outliers(df, columns_to_check):
    """
    Phát hiện và xử lí outliers với IQR method
    Strategy:
    - <5% outliers: Winsorization (1st-99th percentile)
    - 5-15% outliers: IQR Capping
    - >15% outliers: Giữ nguyên
    """
    for column in columns_to_check:
        if not pd.api.types.is_numeric_dtype(df[column].dtype):
            continue
        
        Q1 = df[column].quantile(0.25)
        Q3 = df[column].quantile(0.75)
        IQR = Q3 - Q1
        
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        outliers = ((df[column] < lower_bound) | (df[column] > upper_bound))
        outlier_count = outliers.sum()
        outlier_pct = outlier_count / len(df) * 100
        
        if outlier_count == 0:
            continue
        
        logger.info(f"   • {column}: {outlier_count:,} outliers ({outlier_pct:.2f}%)")
        
        if outlier_pct < 5:
            # Winsorization
            p1 = df[column].quantile(0.01)
            p99 = df[column].quantile(0.99)
            df[column] = df[column].clip(lower=p1, upper=p99)
            
        elif outlier_pct < 15:
            # IQR Capping
            df[column] = df[column].clip(lower=lower_bound, upper=upper_bound)
        
    return df

def feature_engineering(df):
    """Create several derived features and return a new DataFrame.

    The function copies the input DataFrame, creates features on the copy,
    and returns the enhanced DataFrame. The original `df` is not modified.
    """
    df_featured = df.copy()
    features_created = []

    # total star ratings
    if all(col in df_featured.columns for col in ['Five Star', 'Four Star', 'Three Star', 'Two Star', 'One Star']):
        df_featured['total_star_ratings'] = (
            df_featured['Five Star'] + df_featured['Four Star'] + 
            df_featured['Three Star'] + df_featured['Two Star'] + df_featured['One Star']
        )
        features_created.append('total_star_ratings')

    # has reviews flag
    if 'Num Of Reviews' in df_featured.columns:
        df_featured['has_reviews'] = (df_featured['Num Of Reviews'] > 0).astype(int)
        features_created.append('has_reviews')

    # price range buckets
    if 'Price' in df_featured.columns:
        df_featured['price_range'] = pd.cut(
            df_featured['Price'].astype(float),
            bins=[0, 50, 100, 200, 500, float('inf')],
            labels=['Budget', 'Mid', 'Premium', 'High-end', 'Luxury']
        )
        features_created.append('price_range')

    # rating quality buckets
    if 'Average Rating' in df_featured.columns:
        df_featured['rating_quality'] = pd.cut(
            df_featured['Average Rating'].astype(float),
            bins=[0, 2, 3, 4, 5],
            labels=['Poor', 'Fair', 'Good', 'Excellent']
        )
        features_created.append('rating_quality')

    # review density
    if 'Num Of Reviews' in df_featured.columns and 'Number Of Ratings' in df_featured.columns:
        # avoid division by zero by adding 1 to denominator
        df_featured['review_density'] = df_featured['Num Of Reviews'] / (df_featured['Number Of Ratings'] + 1)
        features_created.append('review_density')

    # price per rating
    if 'Price' in df_featured.columns and 'Average Rating' in df_featured.columns:
        df_featured['price_per_rating'] = df_featured['Price'].astype(float) / (df_featured['Average Rating'].astype(float) + 0.1)
        features_created.append('price_per_rating')

    return df_featured

def drop_low_value_columns(df):
    drop_candidates = []
    for col in df.columns:
        null_pct = df[col].isna().sum() / len(df) * 100
        unique_count = df[col].nunique()
        
        should_drop = False
    
    # Drop nếu >95% missing
        if null_pct > 95:
            should_drop = True
    # Drop nếu chỉ 1 giá trị unique
        elif unique_count == 1:
            should_drop = True
    # Drop ID columns không cần thiết
        elif col in ['Uniq Id', 'Pageurl'] and unique_count > len(df) * 0.95:
            should_drop = True
    
        if should_drop:
            drop_candidates.append(col)

    if drop_candidates:
        df = df.drop(columns=drop_candidates)
    
    return df

def normalize_column_names(df):
    df.columns = (df.columns
                .str.strip()
                .str.lower()
                .str.replace(' ', '_')
                .str.replace(r'[^\w]', '', regex=True))

    return df

if __name__ == '__main__':
    path = os.path.join('data', 'Raw', 'marketing_data.csv')
    try:
        df = safe_read_walmart(path)
        print(df.head())
        df = transform(df)
        df.info()
    except Exception as e:
        print(f"Error reading '{path}': {e}")

    # # Lưu clean data
    # timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    # output_file = f'marketing_data_clean_{timestamp}.csv'
    # df.to_csv(output_file, index=False, encoding='utf-8-sig')
    # print(f"✅ Lưu file: {output_file}")

    # # Tạo schema JSON
    # schema = {
    #     'filename': output_file,
    #     'created_at': datetime.now().isoformat(),
    #     'original_rows': 29991,
    #     'final_rows': len(df),
    #     'original_columns': 28,
    #     'final_columns': len(df.columns),
    #     'data_retention_rate': f"{len(df)/29991*100:.2f}%",
    #     'column_info': {}
    # }

    # for col in df.columns:
    #     col_info = {
    #         'dtype': str(df[col].dtype),
    #         'null_count': int(df[col].isna().sum()),
    #         'null_pct': float(df[col].isna().sum() / len(df) * 100),
    #         'unique_count': int(df[col].nunique())
    #     }
        
    #     # Add sample values
    #     if df[col].dtype in ['object', 'category', 'bool']:
    #         col_info['sample_values'] = df[col].dropna().head(5).tolist()
    #     elif 'datetime' in str(df[col].dtype):
    #         col_info['min'] = str(df[col].min()) if pd.notna(df[col].min()) else None
    #         col_info['max'] = str(df[col].max()) if pd.notna(df[col].max()) else None
    #     else:
    #         try:
    #             col_info['min'] = float(df[col].min()) if pd.notna(df[col].min()) else None
    #             col_info['max'] = float(df[col].max()) if pd.notna(df[col].max()) else None
    #             col_info['mean'] = float(df[col].mean()) if pd.notna(df[col].mean()) else None
    #         except:
    #             col_info['sample_values'] = df[col].dropna().head(5).tolist()
        
    #     schema['column_info'][col] = col_info

    # with open('marketing_data_schema.json', 'w', encoding='utf-8') as f:
    #     json.dump(schema, f, indent=2, ensure_ascii=False)
    # print("✅ Lưu schema: marketing_data_schema.json")

    # print("\n" + "="*80)
    # print("🎉 HOÀN THÀNH TOÀN BỘ QUY TRÌNH!")
    # print("📁 Files output:")
    # print(f"   - {output_file}")
    # print("   - marketing_data_schema.json")
    # print("   - data_cleaning_report.txt")
    # print("="*80)
