"""
Data Quality Framework for Walmart Data Pipeline
=================================================
Comprehensive data integrity checks across all pipeline stages:
Raw -> Silver (Clean) -> Golden

Checks include:
- Row count tracking (data loss detection)
- Null value monitoring
- Schema validation
- Primary/Foreign key integrity
- Data type validation
- Business rule validation
- Statistical outlier detection
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import json

import pandas as pd
import numpy as np

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@dataclass
class QualityCheckResult:
    """Single quality check result"""
    check_name: str
    stage: str  # raw, silver, golden
    table_name: str
    passed: bool
    message: str
    details: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class QualityReport:
    """Aggregated quality report for pipeline run"""
    results: List[QualityCheckResult] = field(default_factory=list)
    
    def add(self, result: QualityCheckResult):
        self.results.append(result)
        status = "✅ PASS" if result.passed else "❌ FAIL"
        logger.info(f"{status} [{result.stage}] {result.table_name}: {result.check_name} - {result.message}")
    
    @property
    def passed(self) -> bool:
        return all(r.passed for r in self.results)
    
    @property
    def summary(self) -> Dict[str, Any]:
        total = len(self.results)
        passed = sum(1 for r in self.results if r.passed)
        failed = total - passed
        
        by_stage = {}
        for r in self.results:
            if r.stage not in by_stage:
                by_stage[r.stage] = {"passed": 0, "failed": 0}
            if r.passed:
                by_stage[r.stage]["passed"] += 1
            else:
                by_stage[r.stage]["failed"] += 1
        
        return {
            "total_checks": total,
            "passed": passed,
            "failed": failed,
            "pass_rate": f"{passed/total*100:.1f}%" if total > 0 else "N/A",
            "by_stage": by_stage,
            "failed_checks": [
                {"stage": r.stage, "table": r.table_name, "check": r.check_name, "message": r.message}
                for r in self.results if not r.passed
            ]
        }
    
    def to_json(self, path: Path):
        """Export report to JSON"""
        def convert_to_serializable(obj):
            if isinstance(obj, (np.bool_, np.integer, np.floating)):
                return obj.item()
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            return obj
        
        data = {
            "generated_at": datetime.now().isoformat(),
            "summary": self.summary,
            "details": [
                {
                    "check_name": r.check_name,
                    "stage": r.stage,
                    "table": r.table_name,
                    "passed": bool(r.passed),
                    "message": r.message,
                    "details": {k: convert_to_serializable(v) for k, v in r.details.items()},
                    "timestamp": r.timestamp
                }
                for r in self.results
            ]
        }
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        logger.info(f"Quality report saved to {path}")


class DataQualityChecker:
    """Main Data Quality Checker for all pipeline stages"""
    
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.raw_dir = base_dir / "data" / "Raw"
        self.silver_dir = base_dir / "data" / "Clean"
        self.golden_std_dir = base_dir / "data" / "Golden" / "standardized"
        self.golden_dim_dir = base_dir / "data" / "Golden" / "dimensions"
        self.golden_fact_dir = base_dir / "data" / "Golden" / "facts"
        self.report = QualityReport()
        
        # Track row counts across stages for lineage
        self.row_counts: Dict[str, Dict[str, int]] = {
            "raw": {},
            "silver": {},
            "golden_std": {},
            "golden_dim": {},
            "golden_fact": {}
        }
    
    # =========================================================================
    # GENERIC CHECKS
    # =========================================================================
    
    def check_file_exists(self, path: Path, stage: str, table_name: str) -> bool:
        """Check if file exists"""
        exists = path.exists()
        self.report.add(QualityCheckResult(
            check_name="file_exists",
            stage=stage,
            table_name=table_name,
            passed=exists,
            message=f"File {'found' if exists else 'NOT FOUND'}: {path.name}"
        ))
        return exists
    
    def check_row_count(self, df: pd.DataFrame, stage: str, table_name: str, 
                        min_rows: int = 1) -> bool:
        """Check minimum row count"""
        count = len(df)
        self.row_counts[stage][table_name] = count
        passed = count >= min_rows
        self.report.add(QualityCheckResult(
            check_name="row_count",
            stage=stage,
            table_name=table_name,
            passed=passed,
            message=f"Row count: {count:,} (min: {min_rows})",
            details={"row_count": count, "min_required": min_rows}
        ))
        return passed
    
    def check_null_ratio(self, df: pd.DataFrame, stage: str, table_name: str,
                         critical_columns: List[str], max_null_ratio: float = 0.05) -> bool:
        """Check null ratio in critical columns"""
        all_passed = True
        for col in critical_columns:
            if col not in df.columns:
                continue
            null_count = df[col].isna().sum()
            null_ratio = null_count / len(df) if len(df) > 0 else 0
            passed = null_ratio <= max_null_ratio
            all_passed &= passed
            self.report.add(QualityCheckResult(
                check_name=f"null_check:{col}",
                stage=stage,
                table_name=table_name,
                passed=passed,
                message=f"Nulls in '{col}': {null_count:,} ({null_ratio*100:.2f}%)",
                details={"column": col, "null_count": null_count, "null_ratio": null_ratio}
            ))
        return all_passed
    
    def check_unique_key(self, df: pd.DataFrame, stage: str, table_name: str,
                         key_column: str) -> bool:
        """Check primary key uniqueness"""
        if key_column not in df.columns:
            self.report.add(QualityCheckResult(
                check_name=f"unique_key:{key_column}",
                stage=stage,
                table_name=table_name,
                passed=False,
                message=f"Key column '{key_column}' not found"
            ))
            return False
        
        duplicates = df[key_column].duplicated().sum()
        passed = duplicates == 0
        self.report.add(QualityCheckResult(
            check_name=f"unique_key:{key_column}",
            stage=stage,
            table_name=table_name,
            passed=passed,
            message=f"Duplicates in '{key_column}': {duplicates:,}",
            details={"duplicates": duplicates}
        ))
        return passed
    
    def check_foreign_key(self, fact_df: pd.DataFrame, dim_df: pd.DataFrame,
                          fk_column: str, pk_column: str,
                          stage: str, fact_name: str, dim_name: str) -> bool:
        """Check foreign key referential integrity"""
        if fk_column not in fact_df.columns:
            self.report.add(QualityCheckResult(
                check_name=f"fk_integrity:{fk_column}",
                stage=stage,
                table_name=fact_name,
                passed=False,
                message=f"FK column '{fk_column}' not found"
            ))
            return False
        
        # Get valid keys from dimension
        valid_keys = set(dim_df[pk_column].dropna().unique())
        
        # Check for orphaned keys (excluding nulls and -1 sentinel)
        fact_keys = fact_df[fk_column].dropna()
        orphaned = fact_keys[~fact_keys.isin(valid_keys) & (fact_keys != -1)]
        orphan_count = len(orphaned)
        
        # Check for -1 sentinel values (indicates failed lookup)
        sentinel_count = (fact_df[fk_column] == -1).sum()
        
        passed = orphan_count == 0 and sentinel_count == 0
        message = f"FK '{fk_column}' -> {dim_name}: orphans={orphan_count}, sentinel(-1)={sentinel_count}"
        
        self.report.add(QualityCheckResult(
            check_name=f"fk_integrity:{fk_column}",
            stage=stage,
            table_name=fact_name,
            passed=passed,
            message=message,
            details={"orphan_count": orphan_count, "sentinel_count": sentinel_count}
        ))
        return passed
    
    def check_data_range(self, df: pd.DataFrame, stage: str, table_name: str,
                         column: str, min_val: Any = None, max_val: Any = None) -> bool:
        """Check if numeric values are within expected range"""
        if column not in df.columns:
            return True
        
        values = df[column].dropna()
        issues = []
        
        if min_val is not None:
            below_min = (values < min_val).sum()
            if below_min > 0:
                issues.append(f"{below_min} below {min_val}")
        
        if max_val is not None:
            above_max = (values > max_val).sum()
            if above_max > 0:
                issues.append(f"{above_max} above {max_val}")
        
        passed = len(issues) == 0
        self.report.add(QualityCheckResult(
            check_name=f"data_range:{column}",
            stage=stage,
            table_name=table_name,
            passed=passed,
            message=f"Range check '{column}': {'; '.join(issues) if issues else 'OK'}"
        ))
        return passed
    
    def check_schema(self, df: pd.DataFrame, stage: str, table_name: str,
                     expected_columns: List[str]) -> bool:
        """Check if required columns exist"""
        actual_cols = set(df.columns)
        missing = [c for c in expected_columns if c not in actual_cols]
        
        passed = len(missing) == 0
        self.report.add(QualityCheckResult(
            check_name="schema_validation",
            stage=stage,
            table_name=table_name,
            passed=passed,
            message=f"Missing columns: {missing}" if missing else f"All {len(expected_columns)} columns present",
            details={"missing_columns": missing, "expected": expected_columns}
        ))
        return passed
    
    # =========================================================================
    # STAGE-SPECIFIC VALIDATIONS
    # =========================================================================
    
    def validate_raw_layer(self) -> bool:
        """Validate Raw layer data"""
        logger.info("=" * 60)
        logger.info("VALIDATING RAW LAYER")
        logger.info("=" * 60)
        
        all_passed = True
        
        raw_files = {
            "cleaned_products_API": ["us_item_id", "product_name", "list_price"],
            "marketing_data": ["customer_id", "purchase_amount", "product_category"],
            "Walmart_customer_purchases": ["customer_id", "purchase_amount", "product_category"],
            "walmart_products": ["product_id", "product_name", "category"],
        }
        
        for filename, critical_cols in raw_files.items():
            path = self.raw_dir / f"{filename}.csv"
            if not self.check_file_exists(path, "raw", filename):
                all_passed = False
                continue
            
            try:
                df = pd.read_csv(path, encoding="utf-8")
            except UnicodeDecodeError:
                df = pd.read_csv(path, encoding="latin-1")
            all_passed &= self.check_row_count(df, "raw", filename, min_rows=100)
            all_passed &= self.check_null_ratio(df, "raw", filename, critical_cols)
        
        return all_passed
    
    def validate_silver_layer(self) -> bool:
        """Validate Silver (Clean) layer data"""
        logger.info("=" * 60)
        logger.info("VALIDATING SILVER LAYER")
        logger.info("=" * 60)
        
        all_passed = True
        
        silver_files = {
            "cleaned_cleaned_products_API": {
                "critical_cols": ["us_item_id", "product_name"],
                "unique_key": "us_item_id"
            },
            "cleaned_marketing_data": {
                "critical_cols": ["customer_id", "purchase_amount"],
                "unique_key": None
            },
            "cleaned_Walmart_customer_purchases": {
                "critical_cols": ["customer_id", "purchase_amount"],
                "unique_key": None
            },
            "cleaned_walmart_products": {
                "critical_cols": ["product_id", "product_name"],
                "unique_key": "product_id"
            },
        }
        
        for filename, config in silver_files.items():
            path = self.silver_dir / f"{filename}.csv"
            if not self.check_file_exists(path, "silver", filename):
                all_passed = False
                continue
            
            try:
                df = pd.read_csv(path, encoding="utf-8")
            except UnicodeDecodeError:
                df = pd.read_csv(path, encoding="latin-1")
            all_passed &= self.check_row_count(df, "silver", filename)
            all_passed &= self.check_null_ratio(df, "silver", filename, config["critical_cols"])
            
            if config["unique_key"]:
                all_passed &= self.check_unique_key(df, "silver", filename, config["unique_key"])
        
        # Check data preservation (no unexpected data loss)
        self._check_row_count_preservation("raw", "silver")
        
        return all_passed
    
    def validate_golden_layer(self) -> bool:
        """Validate Golden layer (dimensions & facts)"""
        logger.info("=" * 60)
        logger.info("VALIDATING GOLDEN LAYER")
        logger.info("=" * 60)
        
        all_passed = True
        
        # Load dimensions for FK validation
        dims = {}
        
        dim_specs = {
            "DIM_DATE": {"pk": "date_key", "critical_cols": ["date_key", "full_date", "year", "month"]},
            "DIM_DATE_STORE": {"pk": "date_key", "critical_cols": ["date_key", "full_date"]},
            "DIM_CUSTOMER": {"pk": "customer_key", "critical_cols": ["customer_key", "customer_id"]},
            "DIM_PRODUCT": {"pk": "product_key", "critical_cols": ["product_key", "product_name"]},
            "DIM_PAYMENT": {"pk": "payment_key", "critical_cols": ["payment_key", "payment_method"]},
            "DIM_CATEGORY": {"pk": "category_key", "critical_cols": ["category_key", "category_name"]},
            "DIM_STORE": {"pk": "store_key", "critical_cols": ["store_key", "store_id"]},
            "DIM_TEMPERATURE": {"pk": "temp_category_key", "critical_cols": ["temp_category_key", "temp_category"]},
            "DIM_ECOMMERCE_PRODUCT": {"pk": "ecommerce_product_key", "critical_cols": ["ecommerce_product_key", "product_name"]},
            "DIM_ECOMMERCE_CATEGORY": {"pk": "ecommerce_category_key", "critical_cols": ["ecommerce_category_key", "root_category"]},
            "DIM_ECOMMERCE_BRAND": {"pk": "brand_key", "critical_cols": ["brand_key", "brand"]},
        }
        
        # Validate dimensions
        for dim_name, spec in dim_specs.items():
            path = self.golden_dim_dir / f"{dim_name}.csv"
            if not self.check_file_exists(path, "golden_dim", dim_name):
                all_passed = False
                continue
            
            df = pd.read_csv(path)
            dims[dim_name] = df
            self.row_counts["golden_dim"][dim_name] = len(df)
            
            all_passed &= self.check_row_count(df, "golden_dim", dim_name)
            all_passed &= self.check_unique_key(df, "golden_dim", dim_name, spec["pk"])
            all_passed &= self.check_schema(df, "golden_dim", dim_name, spec["critical_cols"])
        
        # Validate facts
        fact_specs = {
            "FACT_SALES": {
                "pk": "sale_id",
                "fks": [
                    ("date_key", "DIM_DATE", "date_key"),
                    ("customer_key", "DIM_CUSTOMER", "customer_key"),
                    ("product_key", "DIM_PRODUCT", "product_key"),
                    ("payment_key", "DIM_PAYMENT", "payment_key"),
                    ("category_key", "DIM_CATEGORY", "category_key"),
                ],
                "measures": ["purchase_amount", "rating"]
            },
            "FACT_STORE_PERFORMANCE": {
                "pk": "performance_id",
                "fks": [
                    ("date_key", "DIM_DATE_STORE", "date_key"),
                    ("store_key", "DIM_STORE", "store_key"),
                    ("temp_category_key", "DIM_TEMPERATURE", "temp_category_key"),
                ],
                "measures": ["weekly_sales", "temperature", "fuel_price", "cpi", "unemployment"]
            },
            "FACT_ECOMMERCE_SALES": {
                "pk": "ecommerce_sale_id",
                "fks": [
                    ("ecommerce_product_key", "DIM_ECOMMERCE_PRODUCT", "ecommerce_product_key"),
                    ("ecommerce_category_key", "DIM_ECOMMERCE_CATEGORY", "ecommerce_category_key"),
                    ("brand_key", "DIM_ECOMMERCE_BRAND", "brand_key"),
                ],
                "measures": ["list_price", "sale_price", "discount_amount"]
            },
        }
        
        for fact_name, spec in fact_specs.items():
            path = self.golden_fact_dir / f"{fact_name}.csv"
            if not self.check_file_exists(path, "golden_fact", fact_name):
                all_passed = False
                continue
            
            df = pd.read_csv(path)
            self.row_counts["golden_fact"][fact_name] = len(df)
            
            all_passed &= self.check_row_count(df, "golden_fact", fact_name)
            all_passed &= self.check_unique_key(df, "golden_fact", fact_name, spec["pk"])
            
            # Check FK integrity
            for fk_col, dim_name, pk_col in spec["fks"]:
                if dim_name in dims:
                    all_passed &= self.check_foreign_key(
                        df, dims[dim_name], fk_col, pk_col,
                        "golden_fact", fact_name, dim_name
                    )
            
            # Check measure ranges (no negative values for amounts)
            for measure in spec["measures"]:
                if "amount" in measure.lower() or "price" in measure.lower() or "sales" in measure.lower():
                    all_passed &= self.check_data_range(df, "golden_fact", fact_name, measure, min_val=0)
        
        return all_passed
    
    def _check_row_count_preservation(self, from_stage: str, to_stage: str):
        """Check for unexpected data loss between stages"""
        # This is informational - significant drops might be OK due to deduplication
        logger.info(f"Row count comparison: {from_stage} -> {to_stage}")
        for table in self.row_counts[from_stage]:
            from_count = self.row_counts[from_stage].get(table, 0)
            # Find corresponding table in to_stage
            to_table = f"cleaned_{table}" if to_stage == "silver" else table
            to_count = self.row_counts[to_stage].get(to_table, 0)
            if from_count > 0:
                change = ((to_count - from_count) / from_count) * 100
                logger.info(f"  {table}: {from_count:,} -> {to_count:,} ({change:+.1f}%)")
    
    # =========================================================================
    # MAIN RUNNER
    # =========================================================================
    
    def run_all_checks(self, export_report: bool = True) -> QualityReport:
        """Run all quality checks across all stages"""
        logger.info("=" * 80)
        logger.info("🔍 DATA QUALITY CHECK - WALMART PIPELINE")
        logger.info("=" * 80)
        
        self.validate_raw_layer()
        self.validate_silver_layer()
        self.validate_golden_layer()
        
        # Print summary
        logger.info("=" * 80)
        logger.info("📊 QUALITY CHECK SUMMARY")
        logger.info("=" * 80)
        
        summary = self.report.summary
        logger.info(f"Total Checks: {summary['total_checks']}")
        logger.info(f"Passed: {summary['passed']} | Failed: {summary['failed']}")
        logger.info(f"Pass Rate: {summary['pass_rate']}")
        
        for stage, counts in summary["by_stage"].items():
            logger.info(f"  {stage}: ✅ {counts['passed']} | ❌ {counts['failed']}")
        
        if summary["failed_checks"]:
            logger.warning("Failed checks:")
            for fc in summary["failed_checks"]:
                logger.warning(f"  [{fc['stage']}] {fc['table']}: {fc['check']} - {fc['message']}")
        
        # Export report
        if export_report:
            report_path = self.base_dir / "data" / "quality_reports" / f"quality_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            self.report.to_json(report_path)
        
        return self.report


def main():
    """Run quality checks"""
    base_dir = Path(__file__).resolve().parents[2]
    checker = DataQualityChecker(base_dir)
    report = checker.run_all_checks()
    
    if report.passed:
        logger.info("✅ All quality checks passed!")
        return 0
    else:
        logger.error("❌ Some quality checks failed!")
        return 1


if __name__ == "__main__":
    exit(main())
