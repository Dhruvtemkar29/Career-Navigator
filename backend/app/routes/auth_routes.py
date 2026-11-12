
from fastapi import APIRouter, HTTPException, status
from pymongo.errors import DuplicateKeyError, PyMongoError

from app.database import mongodb
from app.schemas.auth_schema import (
    UserRegister,
    UserLogin,
    TokenResponse
)
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

from fastapi import Depends

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register_user(request: UserRegister):
    if mongodb.users_collection is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")

    try:
        user = {
            "full_name": request.full_name.strip(),
            "email": request.email,
            "password_hash": hash_password(request.password)
        }

        result = mongodb.users_collection.insert_one(user)
        user_id = str(result.inserted_id)

        token = create_access_token(user_id)

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "full_name": user["full_name"],
                "email": user["email"]
            }
        }

    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists."
        )

    except PyMongoError:
        raise HTTPException(
            status_code=503,
            detail="Unable to create account."
        )


@router.post("/login", response_model=TokenResponse)
def login_user(request: UserLogin):
    if mongodb.users_collection is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")

    email = request.email.strip().lower()

    user = mongodb.users_collection.find_one({"email": email})

    if not user or not verify_password(
        request.password,
        user["password_hash"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_id = str(user["_id"])
    token = create_access_token(user_id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "full_name": user["full_name"],
            "email": user["email"]
        }
    }


@router.get("/me")
def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user
