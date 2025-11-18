"""
extracting.py
Module for Extract stage of ETL.
Handles safe CSV reading, encoding detection, and optional DuckDB CSV reader.
"""


import os
import re
import logging
import duckdb
import pandas as pd
from charset_normalizer import from_path

logger = logging.getLogger(__name__)
USE_DUCKDB_READ = False

# -----------------------------
# Encoding Detection
# -----------------------------

def detect_encoding(file_path):
    try:
        detection = from_path(file_path, cp_isolation=None)
        best = detection.best()
        if best:
            return best.encoding, best.confidence
    except Exception as e:
        logger.debug(f"Encoding detection failed for {file_path}: {e}")
    return None, 0.0

# -----------------------------
# Robust CSV Reader
# -----------------------------

def safe_read_csv(file_path, **kwargs):
    """Try multiple encodings and fall back to latin1."""

    if not os.path.exists(file_path):
        raise FileNotFoundError(file_path)

    detected_encoding, confidence = detect_encoding(file_path)

    encodings_to_try = [
    detected_encoding,
    'utf-8', 'utf-8-sig',
    'cp1252', 'latin1', 'iso-8859-1',
    'gbk', 'big5', 'shift-jis'
    ]
    encodings_to_try = [e for e in dict.fromkeys([e for e in encodings_to_try if e])]

    for enc in encodings_to_try:
        try:
            df = pd.read_csv(file_path, encoding=enc, low_memory=False, **kwargs)
            logger.info(f"[EXTRACT] Read {file_path} with encoding={enc} (conf={confidence:.2f})")
            return df
        except Exception:
            continue

    logger.warning(f"[EXTRACT] Falling back to latin1 for {file_path}")
    df = pd.read_csv(file_path, encoding='latin1', low_memory=False, **kwargs)

    # Try repairing unicode
    for col in df.select_dtypes(include=['object']).columns:
        try:
            df[col] = df[col].astype(str).apply(lambda s: s.encode('latin1').decode('utf-8', errors='replace'))
        except Exception:
            pass

    return df

# -----------------------------
# Extract Entry Point
# -----------------------------

def extract_csv(file_path):
    """Extract CSV using DuckDB read_csv_auto (optional) or safe pandas reader."""

    if USE_DUCKDB_READ:
        try:
            con = duckdb.connect(database=':memory:')
            df = con.execute(
            f"SELECT * FROM read_csv_auto('{file_path.replace('\\','/')}')").fetchdf()
            con.close()
            logger.info(f"[EXTRACT] DuckDB read_csv_auto succeeded for {file_path}")
            return df
        except Exception:
            logger.warning(f"[EXTRACT] DuckDB read_csv_auto failed for {file_path}, fallback to pandas")

    return safe_read_csv(file_path)