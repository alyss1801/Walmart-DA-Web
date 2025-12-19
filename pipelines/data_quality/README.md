# Data Quality Framework

Module này cung cấp framework kiểm tra toàn vẹn dữ liệu (Data Quality/Integrity Checks) cho toàn bộ pipeline.

## 📁 Structure

```
data_quality/
├── quality_checks.py   # Core quality check framework
├── quality_gate.py     # Integration gateway cho pipeline
└── README.md           # Documentation
```

## 🔍 Các loại kiểm tra

### 1. File & Schema Checks
- ✅ File existence
- ✅ Schema validation (required columns)
- ✅ Row count monitoring

### 2. Key Integrity
- ✅ Primary key uniqueness
- ✅ Foreign key referential integrity
- ✅ Orphaned key detection
- ✅ Sentinel value detection (date_key = -1)

### 3. Data Quality
- ✅ Null ratio monitoring
- ✅ Data range validation
- ✅ Business rule validation

### 4. Lineage Tracking
- ✅ Row count preservation across stages
- ✅ Data loss detection

## 🚀 Usage

### Standalone Check
```python
from quality_checks import DataQualityChecker
from pathlib import Path

base_dir = Path("D:/DA_pipeline/DA")
checker = DataQualityChecker(base_dir)
report = checker.run_all_checks()

if report.passed:
    print("All checks passed!")
else:
    print(f"Failed: {report.summary['failed']} checks")
```

### Integrated Quality Gates
```python
from quality_gate import QualityGate

gate = QualityGate(base_dir, mode="fail")  # or "warn"

# Before Silver processing
gate.pre_silver_check()

# After Silver processing
gate.post_silver_check()

# After Golden processing
gate.post_golden_check()
```

### Command Line
```bash
cd pipelines/data_quality
python quality_checks.py
```

## 📊 Output Report

Reports are saved to `data/quality_reports/` as JSON:
```json
{
  "generated_at": "2025-01-01T12:00:00",
  "summary": {
    "total_checks": 50,
    "passed": 48,
    "failed": 2,
    "pass_rate": "96.0%"
  },
  "details": [...]
}
```

## 🔧 Configuration

### Quality Gate Modes
- `warn`: Log warnings but continue pipeline
- `fail`: Stop pipeline on quality issues

### Customizing Checks
Edit `quality_checks.py` to:
- Add new dimension/fact tables
- Modify null ratio thresholds
- Add business-specific rules
