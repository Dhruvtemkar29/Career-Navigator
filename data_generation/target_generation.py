
import numpy as np
import pandas as pd

RANDOM_SEED = 42


def generate_targets(df, seed=RANDOM_SEED):
    rng = np.random.default_rng(seed)
    df = df.copy()

    # 1. Academic performance
    academic = (
        df["current_cgpa"] / 10 * 100 * 0.7
        + df["academic_score_12th"] * 0.2
        + df["attendance_percentage"] * 0.1
    )

    # 2. Technical ability
    technical = (
        df["programming_score"] * 0.30
        + df["problem_solving_score"] * 0.25
        + df["aptitude_score"] * 0.15
        + df["technical_knowledge_score"] * 0.30
    )

    # 3. Practical experience
    practical = (
        df["practical_skill_score"] * 0.35
        + np.clip(df["academic_projects"] * 12, 0, 100) * 0.20
        + np.clip(df["internship_duration_months"] * 5, 0, 100) * 0.25
        + np.clip(df["certifications_count"] * 8, 0, 100) * 0.10
        + np.clip(df["github_projects"] * 5, 0, 100) * 0.10
    )

    # 4. Professional skills
    professional = (
        df["communication_score"] * 0.30
        + df["teamwork_score"] * 0.25
        + df["leadership_score"] * 0.15
        + df["adaptability_score"] * 0.30
    )

    # 5. Interview performance
    interview = (
        df["mock_interview_score"] * 0.70
        + np.clip(df["interview_preparation_hours"] / 2, 0, 100) * 0.30
    )

    # 6. Resume and preparation
    resume = (
        df["resume_score"] * 0.70
        + np.clip(df["certifications_count"] * 10, 0, 100) * 0.30
    )

    # 7. Placement prediction target
    placement_index = (
        academic * 0.15
        + technical * 0.25
        + practical * 0.20
        + professional * 0.15
        + interview * 0.15
        + resume * 0.10
    )

    placement_index += rng.normal(0, 4, len(df))

    z = (placement_index - 62) / 11
    placement_probability = 1 / (1 + np.exp(-z))

    df["placement_status"] = (
        rng.random(len(df)) < placement_probability
    ).astype(int)

    # 8. Career readiness target
    readiness_index = (
        technical * 0.25
        + practical * 0.20
        + academic * 0.15
        + professional * 0.20
        + interview * 0.20
    )

    readiness_index += rng.normal(0, 3, len(df))
    readiness_index = np.clip(readiness_index, 0, 100)

    # Percentile-based classification
    low_threshold, high_threshold = np.quantile(
        readiness_index, [0.25, 0.75]
    )

    df["career_readiness"] = pd.cut(
        readiness_index,
        bins=[-np.inf, low_threshold, high_threshold, np.inf],
        labels=["Low", "Moderate", "High"],
        include_lowest=True
    ).astype(str)

    # 9. Career domain recommendation
    domain_scores = {
        "Artificial Intelligence & Machine Learning": (
            df["skill_ai_ml"] * 0.50
            + df["interest_ai_ml"] * 0.30
            + df["programming_score"] * 0.10
            + df["problem_solving_score"] * 0.10
        ),
        "Data Science": (
            df["skill_data_science"] * 0.50
            + df["interest_data_science"] * 0.30
            + df["aptitude_score"] * 0.10
            + df["problem_solving_score"] * 0.10
        ),
        "Software Development": (
            df["skill_software_dev"] * 0.50
            + df["interest_software_dev"] * 0.30
            + df["programming_score"] * 0.10
            + df["practical_skill_score"] * 0.10
        ),
        "Cybersecurity": (
            df["skill_cybersecurity"] * 0.50
            + df["interest_cybersecurity"] * 0.30
            + df["problem_solving_score"] * 0.10
            + df["technical_knowledge_score"] * 0.10
        ),
        "Cloud Computing": (
            df["skill_cloud"] * 0.50
            + df["interest_cloud"] * 0.30
            + df["technical_knowledge_score"] * 0.10
            + df["practical_skill_score"] * 0.10
        ),
        "UI/UX Design": (
            df["skill_uiux"] * 0.50
            + df["interest_uiux"] * 0.30
            + df["communication_score"] * 0.10
            + df["adaptability_score"] * 0.10
        )
    }

    domain_names = list(domain_scores.keys())
    score_matrix = np.column_stack(list(domain_scores.values()))

    # Softmax sampling with increased temperature
    temperature = 15.0

    shifted_scores = (
        score_matrix - score_matrix.max(axis=1, keepdims=True)
    ) / temperature

    probabilities = np.exp(shifted_scores)
    probabilities /= probabilities.sum(axis=1, keepdims=True)

    selected_domains = [
        rng.choice(domain_names, p=probabilities[i])
        for i in range(len(df))
    ]

    df["recommended_career_domain"] = selected_domains

    # 10. Employability score
    employability_score = (
        academic * 0.15
        + technical * 0.25
        + practical * 0.20
        + professional * 0.15
        + interview * 0.15
        + resume * 0.10
    )

    employability_score += rng.normal(0, 4, len(df))

    df["employability_score"] = np.clip(
        employability_score, 0, 100
    ).round(2)

    return df


if __name__ == "__main__":
    from data_generation.feature_relationships import generate_student_features

    df = generate_student_features()
    df = generate_targets(df)

    print("Targets generated successfully!")
    print("\nDataset shape:", df.shape)

    print("\nPlacement distribution:")
    print(df["placement_status"].value_counts(normalize=True).mul(100).round(2))

    print("\nCareer readiness distribution:")
    print(df["career_readiness"].value_counts())
    print("\nCareer readiness percentages:")
    print(df["career_readiness"].value_counts(normalize=True).mul(100).round(2))

    print("\nCareer domain distribution:")
    print(df["recommended_career_domain"].value_counts())
    print("\nCareer domain percentages:")
    print(df["recommended_career_domain"].value_counts(normalize=True).mul(100).round(2))

    print("\nEmployability score statistics:")
    print(df["employability_score"].describe())
