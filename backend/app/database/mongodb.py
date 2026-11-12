
import os
from datetime import datetime, timezone
from pymongo import MongoClient, ReturnDocument

from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError

from pathlib import Path

ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH)

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv(
    "DATABASE_NAME",
    "career_navigator"
)

client = None
database = None
prediction_collection = None
users_collection = None


def connect_database():
    global client, database, prediction_collection, users_collection

    if not MONGODB_URI:
        print("MongoDB URI not configured.")
        return False

    try:
        client = MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=5000
        )

        client.admin.command("ping")

        database = client[DATABASE_NAME]
        prediction_collection = database["prediction_history"]
        
        users_collection = database["users"]
        users_collection.create_index("email", unique=True)

        # Each user's idempotency key must be unique.
        # Remove the previous global index if it exists.
        try:
            prediction_collection.drop_index("idempotency_key_1")
        except Exception:
            pass

        prediction_collection.create_index(
            [("user_id", 1), ("idempotency_key", 1)],
            unique=True,
            sparse=True
        )

        print("MongoDB connected successfully!")
        return True

    except PyMongoError as error:
        client = None
        database = None
        prediction_collection = None
        users_collection = None

        print(f"MongoDB connection failed: {error}")
        return False



def save_prediction(user_id, student_data, prediction_result, idempotency_key):
    if prediction_collection is None:
        raise RuntimeError("MongoDB is not connected.")

    try:
        document = {
            "user_id": user_id,
            "idempotency_key": idempotency_key,
            "student_data": student_data,
            "prediction_result": prediction_result,
            "created_at": datetime.now(timezone.utc)
        }

        existing_record = prediction_collection.find_one_and_update(
            {
                "user_id": user_id,
                "idempotency_key": idempotency_key
            },
            {"$setOnInsert": document},
            upsert=True,
            return_document=ReturnDocument.AFTER
        )

        return str(existing_record["_id"])

    except PyMongoError as error:
        print(f"Failed to save prediction: {error}")
        raise


def get_prediction_history(user_id, limit=50):
    if prediction_collection is None:
        raise RuntimeError("MongoDB is not connected.")

    records = list(
        prediction_collection.find({"user_id": user_id})
        .sort("created_at", -1)
        .limit(limit)
    )

    for record in records:
        record["_id"] = str(record["_id"])

    return records


def get_prediction_by_id(record_id, user_id):
    if prediction_collection is None:
        raise RuntimeError("MongoDB is not connected.")

    if not ObjectId.is_valid(record_id):
        return None

    record = prediction_collection.find_one({
        "_id": ObjectId(record_id),
        "user_id": user_id
    })

    if record:
        record["_id"] = str(record["_id"])

    return record


    if prediction_collection is None:
        raise RuntimeError("MongoDB is not connected.")

    try:
        document = {
            "idempotency_key": idempotency_key,
            "student_data": student_data,
            "prediction_result": prediction_result,
            "created_at": datetime.now(timezone.utc)
        }

        existing_record = prediction_collection.find_one_and_update(
            {"idempotency_key": idempotency_key},
            {"$setOnInsert": document},
            upsert=True,
            return_document=ReturnDocument.AFTER
        )

        return str(existing_record["_id"])

    except PyMongoError as error:
        print(f"Failed to save prediction: {error}")
        raise

def close_database():
    global client

    if client is not None:
        client.close()
        client = None

    print("MongoDB connection closed.")

