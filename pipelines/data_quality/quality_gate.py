"""
Data Quality Gateway
====================
Integrate quality checks into pipeline runs.
Can be used as pre/post validation gates.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Literal

from quality_checks import DataQualityChecker, QualityReport

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class QualityGate:
    """
    Quality gate for pipeline stages.
    Can be configured to:
    - WARN: Log warnings but continue
    - FAIL: Stop pipeline on quality issues
    """
    
    def __init__(self, base_dir: Path, mode: Literal["warn", "fail"] = "warn"):
        self.base_dir = base_dir
        self.mode = mode
        self.checker = DataQualityChecker(base_dir)
    
    def pre_silver_check(self) -> bool:
        """Run before Silver layer processing"""
        logger.info("🚧 PRE-SILVER QUALITY GATE")
        passed = self.checker.validate_raw_layer()
        return self._handle_result(passed, "pre-silver")
    
    def post_silver_check(self) -> bool:
        """Run after Silver layer processing"""
        logger.info("🚧 POST-SILVER QUALITY GATE")
        self.checker.validate_raw_layer()
        passed = self.checker.validate_silver_layer()
        return self._handle_result(passed, "post-silver")
    
    def post_golden_check(self) -> bool:
        """Run after Golden layer processing"""
        logger.info("🚧 POST-GOLDEN QUALITY GATE")
        passed = self.checker.validate_golden_layer()
        return self._handle_result(passed, "post-golden")
    
    def full_pipeline_check(self) -> QualityReport:
        """Run all checks for complete pipeline validation"""
        logger.info("🚧 FULL PIPELINE QUALITY GATE")
        return self.checker.run_all_checks()
    
    def _handle_result(self, passed: bool, gate_name: str) -> bool:
        if not passed:
            if self.mode == "fail":
                raise QualityGateError(f"Quality gate '{gate_name}' failed!")
            else:
                logger.warning(f"⚠️ Quality gate '{gate_name}' has warnings but continuing...")
        return passed


class QualityGateError(Exception):
    """Raised when quality gate fails in 'fail' mode"""
    pass


# Convenience functions for integration
def check_before_silver(base_dir: Path, fail_on_error: bool = False) -> bool:
    gate = QualityGate(base_dir, mode="fail" if fail_on_error else "warn")
    return gate.pre_silver_check()


def check_after_silver(base_dir: Path, fail_on_error: bool = False) -> bool:
    gate = QualityGate(base_dir, mode="fail" if fail_on_error else "warn")
    return gate.post_silver_check()


def check_after_golden(base_dir: Path, fail_on_error: bool = False) -> bool:
    gate = QualityGate(base_dir, mode="fail" if fail_on_error else "warn")
    return gate.post_golden_check()
