
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import APP_NAME, APP_VERSION, APP_DESCRIPTION
from app.services.prediction_service import prediction_service
from app.routes.prediction_routes import router as prediction_router
from app.routes.history_routes import router as history_router
from app.database.mongodb import connect_database, close_database
from app.routes.auth_routes import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting Career Navigator API...")

    prediction_service.load_artifacts()
    connect_database()

    print("Career Navigator API is ready!")

    yield

    close_database()
    print("Shutting down Career Navigator API...")


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
    lifespan=lifespan
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def root():
    return {
        "message": "Welcome to Career Navigator API",
        "version": APP_VERSION,
        "status": "Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "models_loaded": prediction_service.preprocessor is not None
    }


app.include_router(prediction_router, prefix="/api/v1")
app.include_router(history_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
