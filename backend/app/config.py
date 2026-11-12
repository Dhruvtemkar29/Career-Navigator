
from pathlib import Path

# Project root: career-navigator/
PROJECT_ROOT = Path(__file__).resolve().parents[2]

# Main directories
MODEL_DIR = PROJECT_ROOT / "models"
DATASET_DIR = PROJECT_ROOT / "dataset"
PROCESSED_DIR = DATASET_DIR / "processed"
REPORT_DIR = PROJECT_ROOT / "reports" / "evaluation"

# Preprocessing artifacts
PREPROCESSOR_PATH = MODEL_DIR / "preprocessor.joblib"
READINESS_ENCODER_PATH = MODEL_DIR / "readiness_encoder.joblib"
DOMAIN_ENCODER_PATH = MODEL_DIR / "domain_encoder.joblib"

# Selected classification models
PLACEMENT_MODEL_PATH = MODEL_DIR / "ann_placement_weighted_final.keras"
READINESS_MODEL_PATH = MODEL_DIR / "baseline_career_readiness_logistic_regression.joblib"
DOMAIN_MODEL_PATH = MODEL_DIR / "baseline_career_domain_logistic_regression.joblib"

# Selected regression model
EMPLOYABILITY_MODEL_PATH = MODEL_DIR / "baseline_employability_linear_regression.joblib"

# API configuration
APP_NAME = "Career Navigator API"
APP_VERSION = "1.0.0"
APP_DESCRIPTION = (
    "ANN-based predictive analytics framework "
    "for student career outcomes and personalized guidance."
)
