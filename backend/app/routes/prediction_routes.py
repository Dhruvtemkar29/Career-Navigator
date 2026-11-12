
from fastapi import APIRouter, HTTPException, Header, Depends

from app.schemas.student_schema import (
    StudentPredictionRequest,
    PredictionResponse
)
from app.services.prediction_service import prediction_service
from app.services.auth_service import get_current_user
from app.database.mongodb import save_prediction

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post("/all", response_model=PredictionResponse)
def predict_all(
    request: StudentPredictionRequest,
    idempotency_key: str = Header(..., alias="Idempotency-Key"),
    current_user: dict = Depends(get_current_user)
):
    try:
        processed_data = prediction_service.prepare_assessment(
            request.student_data
        )

        result = {
            "placement": prediction_service.predict_placement(processed_data),
            "career_readiness": prediction_service.predict_readiness(processed_data),
            "career_domain": prediction_service.predict_domain(processed_data),
            "employability": prediction_service.predict_employability(processed_data)
        }

        record_id = save_prediction(
            current_user["id"],
            request.student_data,
            result,
            idempotency_key
        )

        result["record_id"] = record_id
        return result

    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Prediction failed. Please try again."
        )
