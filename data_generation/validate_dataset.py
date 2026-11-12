
from pathlib import Path
import pandas as pd

ROOT_DIR = Path(__file__).resolve().parents[1]
DATASET_FILE = ROOT_DIR / "dataset" / "raw" / "career_navigator_synthetic.csv"

EXPECTED_ROWS = 15000
EXPECTED_COLUMNS = 49

SCORE_COLUMNS = [
    "academic_score_10th", "academic_score_12th",
    "current_cgpa", "attendance_percentage",
    "practical_skill_score", "programming_score",
    "problem_solving_score", "aptitude_score",
    "technical_knowledge_score", "communication_score",
    "teamwork_score", "leadership_score", "adaptability_score",
    "resume_score", "mock_interview_score",
    "interest_ai_ml", "interest_data_science",
    "interest_software_dev", "interest_cybersecurity",
    "interest_cloud", "interest_uiux",
    "skill_ai_ml", "skill_data_science",
    "skill_software_dev", "skill_cybersecurity",
    "skill_cloud", "skill_uiux"
]

COUNT_COLUMNS = [
    "backlogs", "academic_projects", "major_projects",
    "research_experience", "training_hours",
    "internship_count", "internship_duration_months",
    "certifications_count", "hackathon_participation",
    "hackathon_wins", "github_projects",
    "interview_preparation_hours"
]

def check(condition, message):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {message}")
    return condition

def main():
    print("=" * 65)
    print("CAREER NAVIGATOR - DATASET VALIDATION")
    print("=" * 65)

    if not DATASET_FILE.exists():
        print(f"\nDataset not found: {DATASET_FILE}")
        return

    df = pd.read_csv(DATASET_FILE)
    errors = 0
    warnings = 0

    print(f"\nDataset shape: {df.shape}")

    # 1. Dataset structure
    print("\n1. STRUCTURAL VALIDATION")

    checks = [
        check(len(df) == EXPECTED_ROWS, f"Expected {EXPECTED_ROWS} records"),
        check(len(df.columns) == EXPECTED_COLUMNS, f"Expected {EXPECTED_COLUMNS} columns"),
        check("student_id" in df.columns, "Student ID column exists"),
        check(df["student_id"].is_unique, "Student IDs are unique")
    ]
    errors += checks.count(False)

    # 2. Education distribution
    print("\n2. EDUCATION DISTRIBUTION")

    education_counts = df["education_level"].value_counts()
    print(education_counts)

    checks = [
        check(education_counts.get("UG", 0) == 9000, "UG records = 9000"),
        check(education_counts.get("PG", 0) == 6000, "PG records = 6000")
    ]
    errors += checks.count(False)

    # 3. Missing values
    print("\n3. MISSING VALUE ANALYSIS")

    missing = df.isnull().sum()
    missing = missing[missing > 0]

    if missing.empty:
        print("No missing values found.")
    else:
        print(missing)

    expected_ug_missing = (
        (df["education_level"] == "UG") &
        df["undergraduate_cgpa"].isna()
    ).sum()

    unexpected_missing = df.drop(columns=["undergraduate_cgpa"]).isnull().sum().sum()
    pg_missing = (
        (df["education_level"] == "PG") &
        df["undergraduate_cgpa"].isna()
    ).sum()

    checks = [
        check(expected_ug_missing == 9000, "UG undergraduate CGPA is structurally missing"),
        check(pg_missing == 0, "PG undergraduate CGPA has no missing values"),
        check(unexpected_missing == 0, "No unexpected missing values")
    ]
    errors += checks.count(False)

    # 4. Numerical ranges
    print("\n4. FEATURE RANGE VALIDATION")

    for column in SCORE_COLUMNS:
        if column not in df.columns:
            print(f"[FAIL] Missing column: {column}")
            errors += 1
            continue

        valid = df[column].dropna().between(0, 100).all()
        if not check(valid, f"{column} is between 0 and 100"):
            errors += 1

    cgpa_valid = df["current_cgpa"].between(4, 10).all()
    if not check(cgpa_valid, "Current CGPA is between 4 and 10"):
        errors += 1

    # 5. Count validation
    print("\n5. COUNT AND LOGICAL VALIDATION")

    for column in COUNT_COLUMNS:
        valid = (df[column].dropna() >= 0).all()
        if not check(valid, f"{column} contains no negative values"):
            errors += 1

    checks = [
        check(
            (df["hackathon_wins"] <= df["hackathon_participation"]).all(),
            "Hackathon wins do not exceed participation"
        ),
        check(
            (df.loc[df["internship_count"] == 0, "internship_duration_months"] == 0).all(),
            "Students without internships have zero internship duration"
        ),
        check(
            df["placement_status"].isin([0, 1]).all(),
            "Placement status contains only 0 and 1"
        ),
        check(
            df["career_readiness"].isin(["Low", "Moderate", "High"]).all(),
            "Career readiness labels are valid"
        ),
        check(
            df["employability_score"].between(0, 100).all(),
            "Employability score is between 0 and 100"
        )
    ]
    errors += checks.count(False)

    # 6. Target distributions
    print("\n6. TARGET DISTRIBUTIONS")

    for column in [
        "placement_status",
        "career_readiness",
        "recommended_career_domain"
    ]:
        print(f"\n{column}:")
        print(df[column].value_counts())
        print("\nPercentage:")
        print((df[column].value_counts(normalize=True) * 100).round(2))

    # 7. Duplicate validation
    print("\n7. DUPLICATE VALIDATION")

    duplicate_count = df.duplicated().sum()
    if not check(duplicate_count == 0, "No completely duplicated records"):
        errors += 1

    # 8. Final summary
    print("\n" + "=" * 65)
    print("VALIDATION SUMMARY")
    print("=" * 65)
    print(f"Total records       : {len(df)}")
    print(f"Total columns       : {len(df.columns)}")
    print(f"Validation failures : {errors}")

    if errors == 0:
        print("\nDATASET PASSED ALL VALIDATION CHECKS.")
    else:
        print("\nDATASET HAS VALIDATION FAILURES. Review the results above.")

    print("=" * 65)

if __name__ == "__main__":
    main()
