# 🏗️ Architecture Deep Dive

## System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              React + Vite + Tailwind (SPA)                 │  │
│  │  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │  │
│  │  │ Farmer   │ Consumer │  Admin   │  Yield   │ AgriBot  │  │  │
│  │  │Dashboard │  Market  │  Panel   │Predictor │   RAG    │  │  │
│  │  └──────────┴──────────┴──────────┴────┬─────┴──────────┘  │  │
│  └────────────────────────────────────────│────────────────────┘  │
└───────────────────────────────────────────│───────────────────────┘
                                            │ HTTPS / JSON
                                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend (:8000)                       │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────────┐  │
│  │  CORS    │  │  Pydantic    │  │   Endpoint Router          │  │
│  │Middleware│→ │  Validation  │→ │  /health                   │  │
│  │          │  │              │  │  /api/yield/meta            │  │
│  │          │  │              │  │  /api/yield/baseline        │  │
│  │          │  │              │  │  /api/yield/predict         │  │
│  └──────────┘  └──────────────┘  └────────────┬───────────────┘  │
│                                               │                   │
│  ┌────────────────────────────────────────────▼───────────────┐   │
│  │                 ML Inference Engine                        │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │  Preprocessing: Numeric impute + District one-hot   │  │   │
│  │  │  (sparse CSR matrix preserving XGBoost semantics)   │  │   │
│  │  └────────────────────┬────────────────────────────────┘  │   │
│  │  ┌────────────────────▼────────────────────────────────┐  │   │
│  │  │  Crop Router → 5 XGBoost Boosters (native JSON)    │  │   │
│  │  │  ┌───────┬───────┬───────┬───────┬───────┐         │  │   │
│  │  │  │ Aman  │ Aus   │ Boro  │ Jute  │Potato │         │  │   │
│  │  │  └───────┴───────┴───────┴───────┴───────┘         │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                  Data Layer (CSV on disk)                  │   │
│  │  • cru_crop_season_climate.csv (12,800 rows)              │   │
│  │  • model_comparison_results.csv                           │   │
│  │  • test_set_predictions.csv                               │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Yield Prediction

```
1. User selects crop + district in React UI
       │
2. GET /api/yield/baseline?crop=X&district=Y
       │  → returns CRU TS historical average for 6 climate vars
       │
3. User optionally edits climate values (scenario mode)
       │
4. POST /api/yield/predict  { crop, district, year, 6 climate vars }
       │
5. Backend loads crop-specific preprocessor schema
       │  → numeric features ordered + imputed with training medians
       │  → district one-hot encoded with fitted category order
       │  → assembled into sparse CSR matrix
       │
6. XGBoost Booster.predict(DMatrix)
       │
7. Response: predicted_yield + unit + benchmark metrics + reliability flag
       │
8. React renders prediction card with model transparency panel
```

---

## Model Feature Contract

Each model expects these inputs in this exact order:

| # | Feature | Type | Range |
|---|---|---|---|
| 1 | `year` | int | 1984–2040 |
| 2 | `tmax_mean_c` | float | -5 to 55 |
| 3 | `tmin_mean_c` | float | -10 to 45 |
| 4 | `rain_total_mm` | float | 0 to 10,000 |
| 5 | `vapour_pressure_hpa` | float | 0 to 100 |
| 6 | `cloud_mean_okta` | float | 0 to 8 |
| 7 | `wet_days` | float | 0 to 200 |
| 8 | `district` | string | One of 64 districts → one-hot encoded |

> [!IMPORTANT]
> The sparse CSR matrix layout is critical. Converting to dense changes XGBoost's handling of zero-valued entries and breaks prediction parity.

---

## Model Routing

| Crop | Model File | Preprocessor | Unit |
|---|---|---|---|
| Aman | `aman_xgboost.json` | `aman_preprocessor.json` | t/acre |
| Aus | `aus_xgboost.json` | `aus_preprocessor.json` | t/acre |
| Boro | `boro_xgboost.json` | `boro_preprocessor.json` | t/acre |
| Jute | `jute_xgboost.json` | `jute_preprocessor.json` | bales/acre |
| Potato | `potato_xgboost.json` | `potato_preprocessor.json` | t/acre |

Jute uses bales/acre (1 bale = 180 kg), hence a separate regressor per crop.

---

## CORS Configuration

Controlled via `AGRO_ALLOWED_ORIGINS` environment variable:
- Default: `http://localhost:5173,http://127.0.0.1:5173`
- Docker: adds `http://localhost:8080`

---

## Docker Topology

```
docker-compose.yml
├── api (backend)
│   Port: 8000
│   Healthcheck: GET /health every 20s
│
└── frontend
    Port: 8080 → nginx :80
    Depends on: api (healthy)
    Build arg: VITE_API_BASE_URL=http://localhost:8000
```

---

## Production Architecture Gaps

The following must be added before any public deployment:

| Category | Missing Component |
|---|---|
| **Auth** | Managed authentication (Firebase Auth, Auth0, etc.) |
| **Authorization** | Role-based access control (RBAC) |
| **Database** | Persistent storage (PostgreSQL, Firestore, etc.) |
| **Logging** | Request/response logging, structured logs |
| **Rate Limiting** | API rate limiter (e.g., SlowAPI) |
| **Model Registry** | MLflow or similar version tracking |
| **Monitoring** | APM, error tracking (Sentry, Datadog) |
| **HTTPS** | TLS termination (nginx, cloud LB) |
| **Secrets** | Server-side secrets management (Vault, cloud KMS) |
| **CI/CD** | Automated build, test, deploy pipeline |
| **Backups** | Data and model backup strategy |

---

*Last updated: 2026-11-20*
