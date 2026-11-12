
from pathlib import Path
import pandas as pd

from data_generation.feature_relationships import generate_student_features
from data_generation.target_generation import generate_targets

RANDOM_SEED = 42
TOTAL_RECORDS = 15000

ROOT_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT_DIR / "dataset" / "raw"
METADATA_DIR = ROOT_DIR / "dataset" / "metadata"

OUTPUT_FILE = RAW_DIR / "career_navigator_synthetic.csv"
DICTIONARY_FILE = METADATA_DIR / "data_dictionary.csv"


def create_data_dictionary():
    descriptions = {
        "student_id": "Unique synthetic student identifier",
        "education_level": "UG or PG education level",
        "degree": "Current degree program",
        "specialization": "Academic specialization",
        "study_year": "Current year of study",
        "academic_score_10th": "Class 10 academic percentage",
        "academic_score_12th": "Class 12 academic percentage",
        "undergraduate_cgpa": "Previous undergraduate CGPA; not applicable for UG students",
        "current_cgpa": "Current degree CGPA",
        "backlogs": "Number of academic backlogs",
        "attendance_percentage": "Student attendance percentage",
        "academic_projects": "Number of academic projects",
        "major_projects": "Number of major projects",
        "practical_skill_score": "Practical implementation skill score",
        "research_experience": "Research experience count",
        "training_hours": "Total training hours",
        "programming_score": "Programming proficiency score",
        "problem_solving_score": "Problem-solving score",
        "aptitude_score": "Logical and quantitative aptitude score",
        "technical_knowledge_score": "Technical knowledge score",
        "communication_score": "Communication proficiency score",
        "teamwork_score": "Teamwork score",
        "leadership_score": "Leadership score",
        "adaptability_score": "Adaptability score",
        "internship_count": "Number of internships",
        "internship_duration_months": "Total internship duration in months",
        "certifications_count": "Number of certifications",
        "hackathon_participation": "Number of hackathons participated in",
        "hackathon_wins": "Number of hackathons won",
        "github_projects": "Number of GitHub portfolio projects",
        "resume_score": "Simulated resume assessment score",
        "mock_interview_score": "Mock interview assessment score",
        "interview_preparation_hours": "Interview preparation hours",
        "placement_status": "Simulated placement outcome: 0 or 1",
        "career_readiness": "Simulated career readiness: Low, Moderate or High",
        "recommended_career_domain": "Simulated recommended career domain",
        "employability_score": "Simulated employability score out of 100"
    }

    domain_features = [
        "ai_ml", "data_science", "software_dev",
        "cybersecurity", "cloud", "uiux"
    ]

    for domain in domain_features:
        descriptions[f"interest_{domain}"] = (
            f"Student interest score for {domain}"
        )
        descriptions[f"skill_{domain}"] = (
            f"Student domain skill score for {domain}"
        )

    rows = []

    for column, description in descriptions.items():
        if column in {
            "placement_status",
            "career_readiness",
            "recommended_career_domain",
            "employability_score"
        }:
            role = "Target"
        elif column == "student_id":
            role = "Identifier"
        else:
            role = "Input Feature"

        rows.append({
            "column_name": column,
            "description": description,
            "role": role
        })

    return pd.DataFrame(rows)


def main():
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    METADATA_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("CAREER NAVIGATOR - SYNTHETIC DATASET GENERATOR")
    print("=" * 60)

    print("\n[1/4] Generating student features...")
    df = generate_student_features(
        n=TOTAL_RECORDS,
        seed=RANDOM_SEED
    )

    print("Feature generation completed.")

    print("\n[2/4] Generating prediction targets...")
    df = generate_targets(
        df,
        seed=RANDOM_SEED + 1
    )

    print("Target generation completed.")

    print("\n[3/4] Saving dataset...")
    df.to_csv(OUTPUT_FILE, index=False)

    print("Dataset saved:", OUTPUT_FILE)

    print("\n[4/4] Creating data dictionary...")
    dictionary = create_data_dictionary()
    dictionary.to_csv(DICTIONARY_FILE, index=False)

    print("Data dictionary saved:", DICTIONARY_FILE)

    print("\n" + "=" * 60)
    print("DATASET GENERATION COMPLETED")
    print("=" * 60)

    print("\nDataset shape:", df.shape)
    print("Total students:", len(df))
    print("Total columns:", len(df.columns))

    print("\nEducation distribution:")
    print(df["education_level"].value_counts())

    print("\nPlacement distribution:")
    print(df["placement_status"].value_counts())

    print("\nCareer readiness distribution:")
    print(df["career_readiness"].value_counts())

    print("\nCareer domain distribution:")
    print(df["recommended_career_domain"].value_counts())

    print("\nEmployability score summary:")
    print(df["employability_score"].describe().round(2))

    print("\nMissing values:")
    print(df.isnull().sum()[df.isnull().sum() > 0])

    print("\nFirst five records:")
    print(df.head().to_string(index=False))


if __name__ == "__main__":
    main()
