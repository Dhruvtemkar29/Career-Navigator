# Career Navigator
### An ANN-Based Predictive Analytics Framework for Student Career Outcomes and Personalized Guidance

Career Navigator is an AI-powered career guidance platform that analyzes students' academic performance, technical skills, interests, and career-related attributes to generate personalized career insights and predictions.

The system combines Artificial Neural Networks (ANN), traditional machine learning models, and an interactive web application to help students understand their career readiness and explore suitable career domains.

## Key Features

- **Career Assessment:** Collect academic details, technical skills, interests, and career preferences.
- **Placement Prediction:** Predict placement status using an Artificial Neural Network.
- **Career Readiness Analysis:** Classify students into career readiness categories.
- **Career Domain Recommendation:** Identify suitable career domains based on student profiles.
- **Employability Score:** Estimate an employability score.
- **Skill Gap Analysis:** Identify skills relevant to recommended career paths.
- **Personalized Roadmap:** Provide suggested career development steps.
- **Prediction History:** Store and review previous assessments.
- **Interactive Dashboard:** Visualize predictions and career insights.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite, CSS |
| Backend | Python, FastAPI |
| Database | MongoDB |
| Machine Learning | TensorFlow, Scikit-learn |
| Data Processing | Pandas, NumPy |
| Visualization | Recharts |
| API Communication | Axios |
| Version Control | Git, GitHub |

## Machine Learning Models

The system uses different models for different prediction tasks.

| Prediction Task | Selected Model |
|---|---|
| Placement Status | Artificial Neural Network |
| Career Readiness | Logistic Regression |
| Career Domain | Logistic Regression |
| Employability Score | Linear Regression |

The preprocessing pipeline includes numerical imputation, categorical encoding, missing-value indicators, and feature scaling.

## Dataset

The project uses a synthetic dataset containing **15,000 student records and 49 columns**, including student attributes and four prediction targets.

The prediction targets are:

1. Placement Status
2. Career Readiness
3. Recommended Career Domain
4. Employability Score

The dataset covers six career domains:

- Artificial Intelligence and Machine Learning
- Data Science
- Software Development
- Cybersecurity
- Cloud Computing
- UI/UX Design

**Note:** The dataset is synthetically generated, and its target labels are rule-generated. Therefore, model performance reflects patterns in the synthetic dataset and should not be interpreted as validated real-world placement prediction accuracy.

## Project Structure

```text
career-navigator/
│
├── backend/
│   └── app/
│       ├── database/
│       ├── routes/
│       ├── schemas/
│       ├── services/
│       ├── config.py
│       └── main.py
│
├── data_generation/
├── dataset/
│   ├── metadata/
│   ├── processed/
│   └── raw/
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── services/
│       └── App.jsx
│
├── models/
├── notebooks/
├── reports/
│   ├── eda/
│   └── evaluation/
│
├── src/
├── generate_test_payload.py
├── requirements.txt
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Dhruvtemkar29/Career-Navigator.git
cd Career-Navigator
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
```

Activate the environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables in `backend/.env`, including the MongoDB connection string and database configuration.

Start the backend:

```bash
uvicorn app.main:app --reload
```

Backend API:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Backend root |
| GET | `/health` | Health check |
| POST | `/api/v1/predictions/all` | Generate career predictions |
| GET | `/api/v1/history/` | Retrieve prediction history |
| GET | `/api/v1/history/{record_id}` | Retrieve a specific prediction |

## Research and Evaluation

The project includes:

- Dataset inspection and exploratory data analysis
- Data preprocessing and feature engineering
- Baseline machine learning experiments
- ANN model development
- Model comparison and selection
- Final test-set evaluation

Experiment notebooks and evaluation reports are available in the `notebooks/` and `reports/` directories.

## Limitations

- The dataset is synthetic and does not represent verified real-world student outcomes.
- Predictions depend on the quality and characteristics of the generated dataset.
- Selected skills indicate reported skill exposure, not independently verified proficiency.
- Model probabilities and employability scores should be treated as estimates rather than guarantees.

## Future Scope

- Integration with real-world student outcome datasets.
- Authentication and personalized student accounts.
- Integration with job market and industry skill-demand data.
- More advanced recommendation algorithms.
- Continuous model evaluation and retraining.
- Cloud deployment and production monitoring.

## Author

**Dhruv Temkar**

M.Sc. Artificial Intelligence and Machine Learning
Christ University

## License

This project is developed for academic and research purposes.
