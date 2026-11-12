
from fastapi import APIRouter, HTTPException, Header

from app.schemas.student_schema import (
    StudentPredictionRequest,
    PredictionResponse
)

from app.services.prediction_service import prediction_service
from app.database.mongodb import save_prediction

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post("/all", response_model=PredictionResponse)
def predict_all(
    request: StudentPredictionRequest,
    idempotency_key: str = Header(..., alias="Idempotency-Key")
):
    try:
        # Convert the new assessment into preprocessed model inputs
        processed_data = prediction_service.prepare_assessment(
            request.student_data
        )

        # Generate all four predictions
        result = {
            "placement": prediction_service.predict_placement(
                processed_data
            ),
            "career_readiness": prediction_service.predict_readiness(
                processed_data
            ),
            "career_domain": prediction_service.predict_domain(
                processed_data
            ),
            "employability": prediction_service.predict_employability(
                processed_data
            )
        }

        # Save the original assessment and predictions
        record_id = save_prediction(
            request.student_data,
            result,
            idempotency_key
        )

        result["record_id"] = record_id

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        )
