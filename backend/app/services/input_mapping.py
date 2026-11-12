
import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline


# Original domain names expected by the existing dataset
DOMAINS = {
    "ai_ml": "Artificial Intelligence & Machine Learning",
    "data_science": "Data Science",
    "software_dev": "Software Development",
    "cybersecurity": "Cybersecurity",
    "cloud": "Cloud Computing",
    "uiux": "UI/UX Design"
}

# Skills used to derive domain-specific skill proxies
DOMAIN_SKILLS = {
    "ai_ml": {
        "Machine Learning", "Deep Learning", "NLP",
        "Generative AI", "TensorFlow", "PyTorch"
    },
    "data_science": {
        "Python", "R", "Data Analysis", "Data Visualization",
        "SQL", "MySQL", "PostgreSQL", "Power BI",
        "Tableau", "Excel"
    },
    "software_dev": {
        "Python", "Java", "C", "C++", "JavaScript",
        "TypeScript", "PHP", "HTML", "CSS", "React",
        "Angular", "Node.js", "Express.js", "React Native",
        "Flutter", "MySQL", "MongoDB", "PostgreSQL",
        "Git & GitHub"
    },
    "cybersecurity": {
        "Network Security", "Ethical Hacking",
        "Penetration Testing", "Cryptography", "Linux"
    },
    "cloud": {
        "AWS", "Microsoft Azure", "Google Cloud",
        "Docker", "Linux"
    },
    "uiux": {
        "Figma", "UI/UX Design", "HTML", "CSS"
    }
}

PROGRAMMING_SKILLS = {
    "Python", "Java", "C", "C++",
    "JavaScript", "TypeScript", "R", "PHP"
}

TECHNICAL_SKILLS = set().union(*DOMAIN_SKILLS.values())


def _find_imputer(transformer):
    """Find a fitted SimpleImputer inside a preprocessing transformer."""
    if isinstance(transformer, SimpleImputer):
        return transformer

    if isinstance(transformer, Pipeline):
        for step in transformer.steps:
            result = _find_imputer(step[1])
            if result is not None:
                return result

    return None


def get_training_imputation_values(preprocessor):
    """
    Extract training-set median/mode values from the fitted
    ColumnTransformer used by the original ML pipeline.
    """
    if not hasattr(preprocessor, "transformers_"):
        raise ValueError("The supplied preprocessor is not fitted.")

    values = {}

    for name, transformer, columns in preprocessor.transformers_:
        if name == "remainder" or transformer == "drop":
            continue

        imputer = _find_imputer(transformer)

        if imputer is None:
            continue

        if isinstance(columns, str):
            columns = [columns]

        for column, value in zip(columns, imputer.statistics_):
            values[column] = value

    return values


def validate_assessment(data):
    """Validate the student assessment before mapping."""

    required = [
        "education_level", "degree", "specialization", "study_year",
        "academic_score_10th", "academic_score_12th", "current_cgpa",
        "backlogs", "attendance_percentage", "academic_projects",
        "major_projects", "research_experience", "internship_count",
        "internship_duration_months", "certifications_count",
        "hackathon_participation", "hackathon_wins", "github_projects",
        "communication_rating", "interviews_attended",
        "selected_skills", "preferred_career_domain"
    ]

    missing = [field for field in required if field not in data]

    if missing:
        raise ValueError(f"Missing assessment fields: {missing}")

    if data["education_level"] not in {"UG", "PG"}:
        raise ValueError("Education level must be UG or PG.")

    if not 0 <= float(data["current_cgpa"]) <= 10:
        raise ValueError("Current CGPA must be between 0 and 10.")

    if not 1 <= int(data["communication_rating"]) <= 10:
        raise ValueError("Communication rating must be between 1 and 10.")

    percentage_fields = [
        "academic_score_10th",
        "academic_score_12th",
        "attendance_percentage"
    ]

    for field in percentage_fields:
        if not 0 <= float(data[field]) <= 100:
            raise ValueError(f"{field} must be between 0 and 100.")

    count_fields = [
        "study_year", "backlogs", "academic_projects",
        "major_projects", "research_experience", "internship_count",
        "internship_duration_months", "certifications_count",
        "hackathon_participation", "hackathon_wins",
        "github_projects", "interviews_attended"
    ]

    for field in count_fields:
        value = data[field]

        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"{field} must be a whole number.")

        if not float(value).is_integer() or value < 0:
            raise ValueError(f"{field} must be a non-negative whole number.")

    max_study_year = 4 if data["education_level"] == "UG" else 2

    if not 1 <= data["study_year"] <= max_study_year:
        raise ValueError(
            f"Study year for {data['education_level']} students "
            f"must be between 1 and {max_study_year}."
        )

    if int(data["hackathon_wins"]) > int(data["hackathon_participation"]):
        raise ValueError("Hackathon wins cannot exceed participation.")

    if int(data["major_projects"]) > int(data["academic_projects"]):
        raise ValueError("Major projects cannot exceed academic projects.")

    if data["education_level"] == "PG":
        if data.get("undergraduate_cgpa") is None:
            raise ValueError("Undergraduate CGPA is required for PG students.")
        if not 0 <= float(data["undergraduate_cgpa"]) <= 10:
            raise ValueError("Undergraduate CGPA must be between 0 and 10.")

    valid_degrees = {
        "BA", "BCA", "BCom", "BSc", "BTech",
        "MA", "MBA", "MCA", "MSc", "MTech"
    }

    valid_specializations = {
        "AI & ML", "Artificial Intelligence", "Business",
        "Business Analytics", "Commerce", "Computer Science",
        "Cybersecurity", "Data Science", "Electronics",
        "Finance", "Information Technology"
    }

    if data["degree"] not in valid_degrees:
        raise ValueError("Invalid degree selected.")

    if data["specialization"] not in valid_specializations:
        raise ValueError("Invalid specialization selected.")

    if not isinstance(data["selected_skills"], list):
        raise ValueError("Selected skills must be a list.")

    if len(data["selected_skills"]) != len(set(data["selected_skills"])):
        raise ValueError("Duplicate skills are not allowed.")

    if not all(isinstance(skill, str) for skill in data["selected_skills"]):
        raise ValueError("Every selected skill must be a string.")

    valid_skills = (
        PROGRAMMING_SKILLS
        | TECHNICAL_SKILLS
        | {
            "MySQL", "MongoDB", "PostgreSQL",
            "Express.js", "Git & GitHub"
        }
    )

    invalid = set(data["selected_skills"]) - valid_skills

    if invalid:
        raise ValueError(f"Invalid skills: {sorted(invalid)}")

    if data["preferred_career_domain"] not in DOMAINS.values():
        raise ValueError("Invalid preferred career domain.")


def interview_experience_proxy(interviews):
    """Convert interview experience into a compatibility proxy."""
    if interviews == 0:
        return 20
    if interviews == 1:
        return 35
    if interviews <= 3:
        return 50
    if interviews <= 5:
        return 65
    if interviews <= 10:
        return 80
    return 90


def skill_coverage_score(selected_skills, domain_skills):
    """Calculate a simple skill coverage proxy from 0 to 100."""
    if not domain_skills:
        return 0.0

    matched = selected_skills.intersection(domain_skills)
    return round(len(matched) / len(domain_skills) * 100, 2)


def map_assessment_to_model_input(assessment, preprocessor):
    """
    Convert the redesigned assessment into the original 44-feature
    input format expected by the existing trained models.
    """

    validate_assessment(assessment)

    # Begin with actual training-set imputation values.
    defaults = get_training_imputation_values(preprocessor)

    feature_names = list(preprocessor.feature_names_in_)

    missing_defaults = [
        feature for feature in feature_names
        if feature not in defaults
    ]

    if missing_defaults:
        raise ValueError(
            "Could not retrieve fitted imputation values for: "
            + ", ".join(missing_defaults)
        )

    mapped = {feature: defaults[feature] for feature in feature_names}

    # 1. Direct academic information
    mapped.update({
        "education_level": assessment["education_level"],
        "degree": assessment["degree"],
        "specialization": assessment["specialization"],
        "study_year": int(assessment["study_year"]),
        "academic_score_10th": float(assessment["academic_score_10th"]),
        "academic_score_12th": float(assessment["academic_score_12th"]),
        "current_cgpa": float(assessment["current_cgpa"]),
        "undergraduate_cgpa": (
            float(assessment["undergraduate_cgpa"])
            if assessment["education_level"] == "PG"
            else np.nan
        ),
        "backlogs": int(assessment["backlogs"]),
        "attendance_percentage": float(assessment["attendance_percentage"])
    })

    # 2. Projects and experience
    mapped.update({
        "academic_projects": int(assessment["academic_projects"]),
        "major_projects": int(assessment["major_projects"]),
        "research_experience": int(assessment["research_experience"]),
        "internship_count": int(assessment["internship_count"]),
        "internship_duration_months": int(
            assessment["internship_duration_months"]
        ),
        "certifications_count": int(assessment["certifications_count"]),
        "hackathon_participation": int(
            assessment["hackathon_participation"]
        ),
        "hackathon_wins": int(assessment["hackathon_wins"]),
        "github_projects": int(assessment["github_projects"])
    })

    selected = set(assessment["selected_skills"])

    # 3. Communication self-rating
    mapped["communication_score"] = (
        int(assessment["communication_rating"]) * 10
    )

    # 4. Interview experience proxy
    mapped["mock_interview_score"] = interview_experience_proxy(
        int(assessment["interviews_attended"])
    )

    # 5. Technical skill proxies
    mapped["programming_score"] = skill_coverage_score(
        selected, PROGRAMMING_SKILLS
    )

    mapped["technical_knowledge_score"] = skill_coverage_score(
        selected, TECHNICAL_SKILLS
    )

    # 6. Domain-specific skill proxies
    for domain, skills in DOMAIN_SKILLS.items():
        mapped[f"skill_{domain}"] = skill_coverage_score(
            selected, skills
        )

    # 7. Career preference interest mapping
    preferred = assessment["preferred_career_domain"]

    for domain, domain_name in DOMAINS.items():
        mapped[f"interest_{domain}"] = (
            100.0 if preferred == domain_name else 10.0
        )

    # 8. Return the exact original feature order
    result = pd.DataFrame(
        [[mapped[feature] for feature in feature_names]],
        columns=feature_names
    )

    return result
