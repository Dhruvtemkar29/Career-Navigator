
import joblib
import numpy as np
import pandas as pd

from app.services.input_mapping import map_assessment_to_model_input
from tensorflow.keras.models import load_model

from app.config import (
    PREPROCESSOR_PATH,
    READINESS_ENCODER_PATH,
    DOMAIN_ENCODER_PATH,
    PLACEMENT_MODEL_PATH,
    READINESS_MODEL_PATH,
    DOMAIN_MODEL_PATH,
    EMPLOYABILITY_MODEL_PATH
)


class PredictionService:

    def __init__(self):
        self.preprocessor = None
        self.readiness_encoder = None
        self.domain_encoder = None

        self.placement_model = None
        self.readiness_model = None
        self.domain_model = None
        self.employability_model = None

        self.feature_names = None

    def prepare_assessment(self, assessment_data):
        """
        Convert the redesigned assessment into the original
        44-feature format and preprocess it.
        """
        if self.preprocessor is None or self.feature_names is None:
            raise RuntimeError("Models have not been loaded.")

        mapped_data = map_assessment_to_model_input(
            assessment_data,
            self.preprocessor
        )

        student_data = mapped_data.iloc[0].to_dict()

        return self.preprocess_student(student_data)

    def load_artifacts(self):

        required_files = [
            PREPROCESSOR_PATH,
            READINESS_ENCODER_PATH,
            DOMAIN_ENCODER_PATH,
            PLACEMENT_MODEL_PATH,
            READINESS_MODEL_PATH,
            DOMAIN_MODEL_PATH,
            EMPLOYABILITY_MODEL_PATH
        ]

        missing_files = [
            str(path) for path in required_files
            if not path.exists()
        ]

        if missing_files:
            raise FileNotFoundError(
                "Missing model artifacts:\n" +
                "\n".join(missing_files)
            )

        self.preprocessor = joblib.load(PREPROCESSOR_PATH)

        self.readiness_encoder = joblib.load(
            READINESS_ENCODER_PATH
        )

        self.domain_encoder = joblib.load(
            DOMAIN_ENCODER_PATH
        )

        self.placement_model = load_model(
            PLACEMENT_MODEL_PATH
        )

        self.readiness_model = joblib.load(
            READINESS_MODEL_PATH
        )

        self.domain_model = joblib.load(
            DOMAIN_MODEL_PATH
        )

        self.employability_model = joblib.load(
            EMPLOYABILITY_MODEL_PATH
        )

        self.feature_names = list(
            self.preprocessor.feature_names_in_
        )

        print("All Career Navigator models loaded successfully!")

    def preprocess_student(self, student_data):

        if self.preprocessor is None:
            raise RuntimeError("Models have not been loaded.")

        missing_features = [
            feature for feature in self.feature_names
            if feature not in student_data
        ]

        extra_features = [
            feature for feature in student_data
            if feature not in self.feature_names
        ]

        if missing_features or extra_features:
            raise ValueError({
                "missing_features": missing_features,
                "unexpected_features": extra_features
            })

        student_df = pd.DataFrame(
            [student_data],
            columns=self.feature_names
        )

        return self.preprocessor.transform(student_df)


    def predict_placement(self, processed_data):
        prediction = self.placement_model.predict(
            processed_data, verbose=0
        )[0]

        prediction = np.asarray(prediction).flatten()

        if len(prediction) == 1:
            placement_probability = float(prediction[0])
            predicted_class = int(placement_probability >= 0.5)

        elif len(prediction) == 2:
            predicted_class = int(np.argmax(prediction))
            placement_probability = float(prediction[1])

        else:
            raise ValueError(
                f"Unexpected placement model output shape: {prediction.shape}"
            )

        return {
            "placement_status": (
                "Placed" if predicted_class == 1 else "Not Placed"
            ),
            "placement_probability": round(
                placement_probability, 4
            )
        }


    def predict_readiness(self, processed_data):

        predicted_class = int(
            self.readiness_model.predict(processed_data)[0]
        )

        predicted_label = self.readiness_encoder.inverse_transform(
            [predicted_class]
        )[0]

        probabilities = self.readiness_model.predict_proba(
            processed_data
        )[0]

        return {
            "career_readiness": str(predicted_label),
            "class_probabilities": {
                str(label): round(float(probability), 4)
                for label, probability in zip(
                    self.readiness_encoder.classes_,
                    probabilities
                )
            }
        }

    def predict_domain(self, processed_data):

        predicted_class = int(
            self.domain_model.predict(processed_data)[0]
        )

        predicted_label = self.domain_encoder.inverse_transform(
            [predicted_class]
        )[0]

        probabilities = self.domain_model.predict_proba(
            processed_data
        )[0]

        return {
            "recommended_career_domain": str(predicted_label),
            "domain_probabilities": {
                str(label): round(float(probability), 4)
                for label, probability in zip(
                    self.domain_encoder.classes_,
                    probabilities
                )
            }
        }

    def predict_employability(self, processed_data):

        prediction = self.employability_model.predict(
            processed_data
        )[0]

        prediction = float(
            np.clip(prediction, 0, 100)
        )

        return {
            "employability_score": round(prediction, 2)
        }



prediction_service = PredictionService()
