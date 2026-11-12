
from typing import Optional, Any
from pydantic import BaseModel, Field, ConfigDict


class StudentPredictionRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "student_data": {
                    "education_level": "PG",
                    "degree": "MSc",
                    "specialization": "Artificial Intelligence and Machine Learning",
                    "study_year": 1,
                    "academic_score_10th": 85.0,
                    "academic_score_12th": 82.0,
                    "current_cgpa": 8.5,
                    "undergraduate_cgpa": 8.2,
                    "backlogs": 0,
                    "attendance_percentage": 90.0,
                    "academic_projects": 4,
                    "major_projects": 2,
                    "research_experience": 1,
                    "internship_count": 1,
                    "internship_duration_months": 3,
                    "certifications_count": 3,
                    "hackathon_participation": 2,
                    "hackathon_wins": 1,
                    "github_projects": 4,
                    "communication_rating": 8,
                    "interviews_attended": 2,
                    "selected_skills": [
                        "Python",
                        "Machine Learning",
                        "SQL",
                        "React",
                        "TensorFlow"
                    ],
                    "preferred_career_domain": "Artificial Intelligence & Machine Learning"
                }
            }
        }
    )

    student_data: dict[str, Any] = Field(
        ...,
        description="Student information collected through the redesigned Career Navigator assessment."
    )


class PlacementResponse(BaseModel):
    placement_status: str
    placement_probability: float


class ReadinessResponse(BaseModel):
    career_readiness: str
    class_probabilities: dict[str, float]


class DomainResponse(BaseModel):
    recommended_career_domain: str
    domain_probabilities: dict[str, float]


class EmployabilityResponse(BaseModel):
    employability_score: float


class PredictionResponse(BaseModel):
    placement: PlacementResponse
    career_readiness: ReadinessResponse
    career_domain: DomainResponse
    employability: EmployabilityResponse
    record_id: Optional[str] = None
