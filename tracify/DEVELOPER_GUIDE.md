# 👩‍💻 Developer Guide

## Quick Start

### Prerequisites
- Python 3.11 or 3.12
- Node.js 18+ and npm
- Git
- Docker Desktop (optional, for containerized setup)

---

### Option A: Run Locally

**1. Start the Backend**

```powershell
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Verify:
- Health: http://localhost:8000/health
- Swagger: http://localhost:8000/docs
- Metadata: http://localhost:8000/api/yield/meta

**2. Start the Frontend**

```powershell
cd frontend
npm install
copy .env.example .env     # Keep default: VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

Open: http://localhost:5173

**3. Run Backend Tests**

```powershell
cd backend
pip install pytest httpx
pytest -q
```

Expected: 4 tests passed.

---

### Option B: Docker Compose

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:8000/docs

---

## Project Layout

```
AgriShield-AI2005/
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # ⚠️ Monolith — all 10 modules (~3,100 lines)
│   │   ├── main.tsx         # React entry point
│   │   └── index.css        # Tailwind @apply directives
│   ├── package.json         # React 18 + Vite 5 + Tailwind 3
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── Dockerfile
├── backend/
│   ├── main.py              # FastAPI server — 4 endpoints, 214 lines
│   ├── models/              # 5 XGBoost .json + 5 preprocessor .json
│   ├── data/                # CSV datasets + experiment config
│   ├── test_api.py          # 4 pytest tests
│   ├── requirements.txt
│   └── Dockerfile
├── docs/                    # Architecture, validation, demo script
├── tracify/                 # Project intelligence (you are here)
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Key Conventions

### Backend (Python)
- **Framework:** FastAPI with Pydantic v2 for validation
- **ML Models:** Native XGBoost JSON format (not pickle/joblib)
- **Data:** CSV loaded into Pandas DataFrames at startup
- **Sparse matrices:** XGBoost DMatrix built from SciPy CSR — do not convert to dense
- **Tests:** pytest with FastAPI TestClient
- **Style:** Standard Python (PEP 8). No linter configured yet.

### Frontend (TypeScript/React)
- **Build:** Vite with `@vitejs/plugin-react`
- **Styling:** Tailwind CSS utility classes (no CSS modules or styled-components)
- **Icons:** Lucide React
- **Charts:** Recharts
- **State:** React `useState` / `useEffect` (no state management library yet)
- **Env vars:** Prefixed with `VITE_` for client-side access

---

## Common Tasks

### Add a New API Endpoint

1. Define Pydantic request/response models in `backend/main.py`
2. Add endpoint function with decorator (`@app.get`, `@app.post`, etc.)
3. Add test in `backend/test_api.py`
4. Document in `tracify/API_REFERENCE.md`

### Add a New Frontend Module

Currently everything is in `App.tsx`. To add a module:

1. Create `function NewModuleName({ ...props })` in `App.tsx` (temporary)
2. Add the module to the sidebar nav items array
3. Add a render case in the main content switch block (~line 785)
4. **Future:** When refactoring, create `src/modules/NewModule/index.tsx`

### Retrain a Crop Model

1. Modify the Kaggle notebook in `docs/research_assets/`
2. Export XGBoost native JSON: `booster.save_model("crop_xgboost.json")`
3. Export preprocessor schema with same structure as existing ones
4. Replace files in `backend/models/`
5. Run equivalence test against saved predictions
6. Update metrics in `tracify/ML_MODEL_REGISTRY.md`

### Add a New District

The system supports all 64 districts from the CRU TS dataset automatically. To add districts beyond 64:
1. Add district climate data to `cru_crop_season_climate.csv`
2. Retrain models with the new district in the one-hot encoder
3. Update preprocessor schemas with new `district_categories`

---

## Environment Variables

### Backend

| Variable | Default | Description |
|---|---|---|
| `AGRO_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | CORS allowed origins |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_FIREBASE_API_KEY` | — | Firebase API key (optional) |
| `VITE_FIREBASE_AUTH_DOMAIN` | — | Firebase auth domain (optional) |
| `VITE_FIREBASE_PROJECT_ID` | — | Firebase project ID (optional) |
| `VITE_FIREBASE_STORAGE_BUCKET` | — | Firebase storage bucket (optional) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | — | Firebase messaging sender (optional) |
| `VITE_FIREBASE_APP_ID` | — | Firebase app ID (optional) |

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `ModuleNotFoundError: xgboost` | Activate venv and `pip install -r requirements.txt` |
| CORS error in browser | Check `AGRO_ALLOWED_ORIGINS` matches your frontend URL |
| Frontend shows "API Offline" | Ensure backend is running on port 8000 |
| Prediction returns 400 | Verify district name matches one of 64 known districts |
| Docker build fails | Ensure Docker Desktop is running; check network for npm registry |
| Firebase auth errors | Firebase config is optional; ignore if using demo fallback |

---

## Contribution Workflow (Recommended)

1. Create a feature branch: `git checkout -b feature/module-name`
2. Make changes
3. Run backend tests: `cd backend && pytest -q`
4. Run frontend build: `cd frontend && npm run build`
5. Update relevant tracify docs if architecture changes
6. Submit pull request with description

---

*Last updated: 2026-11-20*
