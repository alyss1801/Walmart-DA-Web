import pandas as pd
import os
from charset_normalizer import from_path
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)
DATE_FORMAT = '%m-%d-%y'

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
            print(f"Read success with encoding={enc} (C engine)")
            return df
        except UnicodeDecodeError as e:
            last_err = e
            # try next encoding
            continue
        except pd.errors.ParserError as e:
            # Tokenization/parsing error with C engine — try python engine with permissive on_bad_lines
            try:
                df = pd.read_csv(file_path, encoding=enc, engine='python', on_bad_lines='warn')
                print(f"Read success with encoding={enc} (python engine, on_bad_lines=warn)")
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
        print("Read success with fallback encoding=latin1 (python engine)")
        # try to coerce text columns back to utf-8 where possible
        for col in df.select_dtypes(include=['object']).columns:
            try:
                df[col] = df[col].astype(str).apply(lambda s: s.encode('latin1').decode('utf-8', errors='replace'))
            except Exception:
                pass
        return df
    except Exception as e:
        raise RuntimeError(f"Cannot read file despite fallbacks: {file_path} | Last error: {last_err or e}")
    
def transform(df):
    df['Purchase_Date'] = pd.to_datetime(df['Purchase_Date'], format=DATE_FORMAT, errors='coerce')
    df['Year'] = df['Purchase_Date'].dt.year
    df['Month'] = df['Purchase_Date'].dt.month
    df['DayOfWeek'] = df['Purchase_Date'].dt.day_name() 
    df.reset_index(drop=True, inplace=True)
    return df


if __name__ == '__main__':
    path = os.path.join('data\\Raw', 'Walmart_customer_purchases.csv')
    try:
        df = safe_read_walmart(path)
        print(df.head())
        df = transform(df)
        df.info()
    except Exception as e:
        print(f"Error reading '{path}': {e}")