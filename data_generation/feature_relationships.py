
import numpy as np
import pandas as pd

RANDOM_SEED = 42


def clipped_normal(rng, mean, std, size, minimum=0, maximum=100):
    values = rng.normal(mean, std, size)
    return np.clip(values, minimum, maximum).round(2)


def generate_student_features(n=15000, seed=RANDOM_SEED):
    rng = np.random.default_rng(seed)

    # 1. Student and education information
    education_level = np.array(
        ["UG"] * int(n * 0.60) +
        ["PG"] * (n - int(n * 0.60))
    )
    rng.shuffle(education_level)

    degrees = []
    specializations = []
    study_year = []

    ug_degrees = ["BSc", "BCA", "BTech", "BCom", "BA"]
    pg_degrees = ["MSc", "MCA", "MTech", "MBA", "MA"]

    ug_specializations = [
        "Computer Science", "Information Technology",
        "Data Science", "Artificial Intelligence",
        "Electronics", "Commerce", "Business"
    ]

    pg_specializations = [
        "AI & ML", "Data Science", "Computer Science",
        "Information Technology", "Cybersecurity",
        "Finance", "Business Analytics"
    ]

    for level in education_level:
        if level == "UG":
            degrees.append(rng.choice(ug_degrees))
            specializations.append(rng.choice(ug_specializations))
            study_year.append(rng.integers(1, 5))
        else:
            degrees.append(rng.choice(pg_degrees))
            specializations.append(rng.choice(pg_specializations))
            study_year.append(rng.integers(1, 3))
    study_year = np.array(study_year)

    # 2. Latent student abilities
    academic_ability = rng.normal(0, 1, n)
    technical_ability = (
        0.45 * academic_ability + rng.normal(0, 0.89, n)
    )
    practical_ability = (
        0.35 * technical_ability + rng.normal(0, 0.94, n)
    )
    professional_ability = (
        0.25 * academic_ability + rng.normal(0, 0.97, n)
    )

    def score(base, factor, noise=10):
        return np.clip(
            base + factor * 10 + rng.normal(0, noise, n),
            0, 100
        ).round(2)

    # 3. Academic attributes
    score_10th = score(75, academic_ability)
    score_12th = score(73, academic_ability)
    ug_cgpa = np.clip(
        7.2 + 0.65 * academic_ability + rng.normal(0, 0.55, n),
        4, 10
    ).round(2)

    current_cgpa = np.clip(
        7.2 + 0.65 * academic_ability +
        np.where(education_level == "PG", 0.2, 0) +
        rng.normal(0, 0.55, n),
        4, 10
    ).round(2)

    ug_cgpa = np.where(education_level == "UG", np.nan, ug_cgpa)

    backlogs = np.where(
        academic_ability > 0.8,
        rng.poisson(0.15, n),
        rng.poisson(0.55, n)
    )
    backlogs = np.clip(backlogs, 0, 8)

    # 4. Academic and practical performance
    attendance = np.clip(
        78 + 6 * academic_ability + rng.normal(0, 10, n),
        40, 100
    ).round(2)

    academic_projects = np.clip(
        rng.poisson(2.2, n) + (study_year >= 3),
        0, 10
    ).astype(int)

    major_projects = np.clip(
        rng.poisson(0.8, n) + (study_year == 4),
        0, 5
    ).astype(int)

    practical_skill = score(62, practical_ability, 12)

    research_experience = np.clip(
        rng.poisson(0.5, n) + (education_level == "PG"),
        0, 5
    ).astype(int)

    training_hours = np.clip(
        rng.gamma(2.0, 35, n),
        0, 500
    ).round().astype(int)

    # 5. Technical and professional scores
    programming = score(62, technical_ability)
    problem_solving = score(64, technical_ability)
    aptitude = score(65, academic_ability)
    technical_knowledge = score(63, technical_ability)
    communication = score(66, professional_ability)
    teamwork = score(70, professional_ability)
    leadership = score(60, professional_ability)
    adaptability = score(68, professional_ability)

    # 6. Employability experience
    internship_count = np.clip(
        rng.poisson(0.7 + 0.3 * (education_level == "PG"), n),
        0, 5
    ).astype(int)

    internship_duration = np.where(
        internship_count > 0,
        rng.integers(1, 7, n) * internship_count,
        0
    )
    internship_duration = np.clip(internship_duration, 0, 24)

    certifications = np.clip(
        rng.poisson(2.0 + training_hours / 180, n),
        0, 15
    ).astype(int)

    hackathon_participation = np.clip(
        rng.poisson(1.0, n), 0, 10
    ).astype(int)

    hackathon_wins = np.array([
        rng.binomial(count, 0.15) for count in hackathon_participation
    ])

    github_projects = np.clip(
        rng.poisson(2.0 + academic_projects * 0.7, n),
        0, 30
    ).astype(int)

    resume_score = score(
        58, practical_ability * 0.5 + professional_ability * 0.5
    )

    mock_interview = score(58, professional_ability)

    interview_hours = np.clip(
        rng.gamma(2.0, 18, n),
        0, 200
    ).round().astype(int)

    # 7. Career interests
    domains = [
        "ai_ml", "data_science", "software_dev",
        "cybersecurity", "cloud", "uiux"
    ]

    interests = {
        f"interest_{domain}": rng.uniform(10, 100, n).round(2)
        for domain in domains
    }

    # 8. Domain-specific skills
    domain_skills = {
        "skill_ai_ml": score(45, technical_ability),
        "skill_data_science": score(45, technical_ability * 0.7 + academic_ability * 0.3),
        "skill_software_dev": score(45, programming / 10 * 0.7 + practical_ability * 0.3),
        "skill_cybersecurity": score(45, technical_ability * 0.7 + problem_solving / 10 * 0.3),
        "skill_cloud": score(45, technical_ability * 0.7 + practical_ability * 0.3),
        "skill_uiux": score(45, professional_ability * 0.6 + practical_ability * 0.4)
    }

    # 9. Assemble dataset
    df = pd.DataFrame({
        "student_id": [f"CN{i:06d}" for i in range(1, n + 1)],
        "education_level": education_level,
        "degree": degrees,
        "specialization": specializations,
        "study_year": study_year,
        "academic_score_10th": score_10th,
        "academic_score_12th": score_12th,
        "undergraduate_cgpa": ug_cgpa,
        "current_cgpa": current_cgpa,
        "backlogs": backlogs,
        "attendance_percentage": attendance,
        "academic_projects": academic_projects,
        "major_projects": major_projects,
        "practical_skill_score": practical_skill,
        "research_experience": research_experience,
        "training_hours": training_hours,
        "programming_score": programming,
        "problem_solving_score": problem_solving,
        "aptitude_score": aptitude,
        "technical_knowledge_score": technical_knowledge,
        "communication_score": communication,
        "teamwork_score": teamwork,
        "leadership_score": leadership,
        "adaptability_score": adaptability,
        "internship_count": internship_count,
        "internship_duration_months": internship_duration,
        "certifications_count": certifications,
        "hackathon_participation": hackathon_participation,
        "hackathon_wins": hackathon_wins,
        "github_projects": github_projects,
        "resume_score": resume_score,
        "mock_interview_score": mock_interview,
        "interview_preparation_hours": interview_hours,
        **interests,
        **domain_skills
    })

    return df


if __name__ == "__main__":
    df = generate_student_features()

    print("Dataset generated successfully!")
    print("Shape:", df.shape)
    print("\nFirst five records:")
    print(df.head())
    print("\nMissing values:")
    print(df.isnull().sum().sum())
