# AgriShield AI

**Climate-smart agriculture decision support for Bangladesh**

This delivery keeps the supplied AgriShield React prototype and adds a working FastAPI inference service that calls five trained crop-specific XGBoost yield models.

## What is connected in this delivery

- Five fitted XGBoost models: Aman, Aus, Boro, Jute and Potato.
- Model inference is served by FastAPI, not simulated in the browser.
- The preprocessing layout (numeric imputation and district one-hot category order) is saved with each native XGBoost JSON model.
- District/crop climate baselines are calculated from the supplied CRU TS crop-season dataset (64 districts, 12,800 crop records across five crops).
- The UI lets a presenter edit the six crop-season climate variables, choose a district/crop/year, call the API, and inspect the prediction plus held-out validation metrics.
- Admin panel checks the ML API health endpoint.
- Original model comparison metrics, best-model table, held-out predictions, training notebook and dataset archive are included under `backend/data/` and `docs/research_assets/`.

The deployed inference selection uses XGBoost because it had the lower held-out RMSE for each crop in the supplied comparison table. Random Forest results remain in the model comparison report. The five Random Forest artifacts are not loaded by the live inference API.

## Project structure

```text
AgriShield_AI/
├── frontend/
│   ├── src/App.tsx                 # Existing AgriShield UI + integrated Yield Prediction module
│   ├── src/main.tsx
│   ├── src/index.css
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── main.py                     # FastAPI endpoints
│   ├── models/                     # Five native XGBoost JSON models + preprocessing schemas
│   ├── data/                       # CRU climate dataset + benchmark outputs
│   └── requirements.txt
├── docs/
│   ├── ARCHITECTURE.md
│   ├── MODEL_VALIDATION.md
│   ├── DEMO_SCRIPT.md
│   └── research_assets/            # Original notebook and dataset archive
└── README.md
```

## Run locally

### 1. Start the backend

Use Python 3.11 or 3.12.

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Check:
- API health: http://localhost:8000/health
- Interactive API docs: http://localhost:8000/docs
- Model metadata: http://localhost:8000/api/yield/meta

Expected health response includes five loaded models, 64 districts and 12,800 climate rows.

### 2. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env` and keep the default local API URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Then run:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, normally http://localhost:5173.

### 3. Demonstrate a real prediction

1. Open **AI Yield Prediction** from the farmer sidebar.
2. Select a crop and one of the 64 districts.
3. The app loads the CRU TS historical climate baseline for that crop/district.
4. Keep the baseline values or edit them to form a scenario.
5. Choose the scenario year and click **Run yield prediction**.
6. The browser sends the inputs to FastAPI. The backend loads the crop-specific native XGBoost model and returns its prediction and saved test metrics.
7. Open **Admin & System** to show whether the ML API is online.

The baseline is an average of historical crop-season climate records, not a live weather forecast. User edits are scenario inputs.

## Docker option

With Docker Desktop installed, run from the project root:

```bash
docker compose up --build
```

Then open the frontend at http://localhost:8080 and the API docs at http://localhost:8000/docs.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | API/model/dataset health |
| GET | `/api/yield/meta` | Supported crops, districts and feature list |
| GET | `/api/yield/baseline?crop=Boro&district=Gazipur` | Historical CRU crop-season baseline |
| POST | `/api/yield/predict` | Real XGBoost inference |

Example request body:

```json
{
  "crop": "Boro",
  "district": "Gazipur",
  "year": 2027,
  "tmax_mean_c": 29.99,
  "tmin_mean_c": 18.18,
  "rain_total_mm": 467.13,
  "vapour_pressure_hpa": 21.27,
  "cloud_mean_okta": 3.22,
  "wet_days": 24.47
}
```

## Important setup and honest demo boundaries

This project is a working prototype, not a fully production-hardened commercial platform.

- **Yield Prediction:** connected to the five supplied trained XGBoost models and tested through the API.
- **Climate & Risk:** existing transparent rule-based prototype. It is not one of the trained yield models.
- **Disease Scanner:** the current UI contains sample presets and an offline fallback. No custom trained leaf-disease classifier is connected in this delivery. The Gemini API key in the original code is blank.
- **AgriBot:** knowledge-grounded local fallback content is available; Gemini API integration requires a secure server-side key setup. Do not place a private Gemini key in frontend source code.
- **Farm Planner, Smart Irrigation, Satellite NDVI, Marketplace, Harvest Traceability:** the existing prototype contains interactive UI and sample/demo records. Real sensor feeds, satellite provider credentials, payment gateway, production database and authenticated user accounts still require provider configuration and deployment work.
- **Firebase:** the supplied frontend had a demo Firebase fallback. Add a real Firebase project configuration and Firestore security rules before using real user or order data.

Do not describe demo values as live observations, actual transactions, official BMD forecasts, or field-validated disease diagnoses.

## Data attribution

The crop-yield/climate dataset README identifies BBS crop statistics, BMD station sources, CRU TS 4.10 crop-season climate and the companion dataset DOI `10.17632/czp77g2kpp.1`. The included dataset README describes component-specific licences and attribution requirements. Review those terms before redistribution or public hosting. The 2014–2023 purchased BMD station observations are not redistributed in the dataset; this project uses the CRU TS crop-season layer for model features.

## Validation

See [`docs/MODEL_VALIDATION.md`](docs/MODEL_VALIDATION.md) for the actual saved metrics, caveats and prediction-equivalence check for the portable model export.
