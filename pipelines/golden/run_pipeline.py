"""
Run the Golden layer pipeline end-to-end.

Steps:
1) Standardize columns from data/Clean into data/Golden/standardized
2) Build dimensions into data/Golden/dimensions
3) Build facts into data/Golden/facts
4) Run Data Quality Checks (integrated)
"""

from __future__ import annotations

import logging
import re
import sys
from pathlib import Path

import duckdb

from build_dims import DimensionBuilder
from build_facts import FactBuilder
from standardize_columns import ColumnStandardizer

# Add data_quality to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "data_quality"))
from quality_checks import DataQualityChecker

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def main():
    base_dir = Path(__file__).resolve().parents[2]
    clean_dir = base_dir / "data" / "Clean"
    std_dir = base_dir / "data" / "Golden" / "standardized"
    dim_dir = base_dir / "data" / "Golden" / "dimensions"
    fact_dir = base_dir / "data" / "Golden" / "facts"
    db_path = base_dir / "database" / "walmart_analytics.db"

    logger.info("=" * 80)
    logger.info("START GOLDEN PIPELINE")
    logger.info("=" * 80)

    ColumnStandardizer(clean_dir, std_dir).run()
    dims = DimensionBuilder(std_dir, dim_dir).build_all()
    facts = FactBuilder(std_dir, dim_dir, fact_dir).build_all()

    # Load all golden CSVs into DuckDB warehouse
    dim_files = sorted(dim_dir.glob("*.csv"))
    fact_files = sorted(fact_dir.glob("*.csv"))
    if not db_path.parent.exists():
        db_path.parent.mkdir(parents=True, exist_ok=True)

    def to_table_name(path: Path) -> str:
        stem = path.stem
        return re.sub(r"[^0-9a-zA-Z_]", "_", stem).lower()

    with duckdb.connect(database=str(db_path)) as conn:
        # =====================================================================
        # CLEANUP: Drop all existing tables to ensure fresh state
        # =====================================================================
        existing_tables = conn.execute("SHOW TABLES").fetchall()
        for (table_name,) in existing_tables:
            conn.execute(f"DROP TABLE IF EXISTS {table_name}")
            logger.info("Dropped old table: %s", table_name)
        
        # =====================================================================
        # Load fresh tables from Golden CSVs
        # =====================================================================
        for csv_path in dim_files + fact_files:
            table_name = to_table_name(csv_path)
            conn.execute(
                f"CREATE OR REPLACE TABLE {table_name} AS SELECT * FROM read_csv_auto(?, header=True)",
                [str(csv_path)],
            )
            row_count = conn.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]
            logger.info("Loaded %s into DuckDB table %s (%d rows)", csv_path.name, table_name, row_count)

    logger.info("=" * 80)
    logger.info("PIPELINE SUMMARY")
    logger.info("=" * 80)
    logger.info("Dimensions: %s", {k: len(v) if v is not None else 0 for k, v in dims.items()})
    logger.info("Facts: %s", {k: len(v) if v is not None else 0 for k, v in facts.items()})
    logger.info("Outputs stored under %s/data/Golden", base_dir)
    logger.info("DuckDB database updated at %s", db_path)

    # =========================================================================
    # STEP 4: DATA QUALITY CHECKS
    # =========================================================================
    logger.info("=" * 80)
    logger.info("STEP 4: RUNNING DATA QUALITY CHECKS")
    logger.info("=" * 80)
    
    checker = DataQualityChecker(base_dir)
    report = checker.run_all_checks(export_report=True)
    
    if report.passed:
        logger.info("✅ All quality checks passed!")
    else:
        logger.warning("⚠️ Some quality checks failed - review the report")
        summary = report.summary
        logger.warning(f"Failed checks: {summary['failed']} / {summary['total_checks']}")
        for fc in summary['failed_checks']:
            logger.warning(f"  [{fc['stage']}] {fc['table']}: {fc['check']}")

    # =========================================================================
    # STEP 5: EXPORT DATA TO WEB (JSON files)
    # =========================================================================
    logger.info("=" * 80)
    logger.info("STEP 5: EXPORTING DATA TO WEB JSON FILES")
    logger.info("=" * 80)
    
    try:
        # Import and run the export script
        scripts_dir = base_dir / "scripts"
        sys.path.insert(0, str(scripts_dir))
        from export_to_web import main as export_main
        export_main()
        logger.info("✅ Web data exported successfully!")
    except Exception as e:
        logger.warning(f"⚠️ Failed to export web data: {e}")

    logger.info("=" * 80)
    logger.info("Golden pipeline finished successfully.")
    
    return report.passed


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
