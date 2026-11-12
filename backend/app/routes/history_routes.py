
from fastapi import APIRouter, HTTPException, Query

from app.database.mongodb import (
    get_prediction_history,
    get_prediction_by_id
)

router = APIRouter(
    prefix="/history",
    tags=["Prediction History"]
)


@router.get("/")
def prediction_history(
    limit: int = Query(default=50, ge=1, le=100)
):

    try:
        records = get_prediction_history(limit)

        return {
            "total_records": len(records),
            "history": records
        }

    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error))


@router.get("/{record_id}")
def prediction_details(record_id: str):

    try:
        record = get_prediction_by_id(record_id)

        if record is None:
            raise HTTPException(
                status_code=404,
                detail="Prediction record not found."
            )

        return record

    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error))
