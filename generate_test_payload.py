import pandas as pd
import json

df = pd.read_csv("dataset/raw/career_navigator_synthetic.csv")

excluded_columns = [
    "student_id",
    "placement_status",
    "career_readiness",
    "recommended_career_domain",
    "employability_score"
]

feature_columns = [
    column for column in df.columns
    if column not in excluded_columns
]

sample = df.loc[0, feature_columns].to_dict()

payload = {
    "student_data": sample
}

with open("test_student_payload.json", "w") as file:
    json.dump(
        payload,
        file,
        indent=4,
        default=lambda value: value.item()
        if hasattr(value, "item") else str(value)
    )

print("Test payload generated successfully!")
print("Number of input features:", len(feature_columns))
print("File: test_student_payload.json")