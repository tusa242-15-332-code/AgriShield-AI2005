# 📡 API Reference

> **Base URL:** `http://localhost:8000` (dev) | Configure via `VITE_API_BASE_URL`
> **Auto-generated docs:** `{BASE_URL}/docs` (Swagger UI) | `{BASE_URL}/redoc` (ReDoc)

---

## Endpoints Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | None | Service info |
| `GET` | `/health` | None | System health check |
| `GET` | `/api/yield/meta` | None | Model metadata |
| `GET` | `/api/yield/baseline` | None | Historical climate baseline |
| `POST` | `/api/yield/predict` | None | Run yield prediction |

> [!NOTE]
> All endpoints currently have **no authentication**. Add JWT middleware before production use.

---

## `GET /`

**Purpose:** Service identification.

**Response:**
```json
{
  "service": "AgriShield AI API",
  "status": "ok",
  "docs": "/docs"
}
```

---

## `GET /health`

**Purpose:** System health check — verifies models are loaded, data is available.

**Response (200):**
```json
{
  "status": "healthy",
  "loaded_models": ["Aman", "Aus", "Boro", "Jute", "Potato"],
  "expected_models": ["Aman", "Aus", "Boro", "Jute", "Potato"],
  "district_count": 64,
  "dataset_rows": 12800,
  "model_format": "XGBoost native JSON"
}
```

**Health verification checks:**
- `loaded_models` count equals `expected_models` count
- `district_count` = 64
- `dataset_rows` = 12,800

---

## `GET /api/yield/meta`

**Purpose:** Returns supported crops, districts, and feature list.

**Response (200):**
```json
{
  "crops": ["Aman", "Aus", "Boro", "Jute", "Potato"],
  "districts": ["Bagerhat", "Bandarban", "Barguna", "...64 total..."],
  "features": ["year", "tmax_mean_c", "tmin_mean_c", "rain_total_mm",
               "vapour_pressure_hpa", "cloud_mean_okta", "wet_days", "district"],
  "model_name": "XGBoost Regressor",
  "model_count": 5,
  "training_period": "1984-2015",
  "test_period": "2016-2023",
  "climate_source": "CRU TS crop-season climate"
}
```

---

## `GET /api/yield/baseline`

**Purpose:** Returns historical CRU TS crop-season climate averages for a given crop and district.

**Query Parameters:**

| Param | Type | Required | Example |
|---|---|---|---|
| `crop` | string | ✅ | `Boro` |
| `district` | string | ✅ | `Gazipur` |

**Example:** `GET /api/yield/baseline?crop=Boro&district=Gazipur`

**Response (200):**
```json
{
  "crop": "Boro",
  "district": "Gazipur",
  "years_covered": [1984, 2023],
  "records": 40,
  "climate": {
    "tmax_mean_c": 29.9888,
    "tmin_mean_c": 18.1818,
    "rain_total_mm": 467.1337,
    "vapour_pressure_hpa": 21.2663,
    "cloud_mean_okta": 3.2178,
    "wet_days": 24.4727
  },
  "source_label": "CRU TS crop-season historical average (1984-2023) • editable scenario baseline"
}
```

**Error Responses:**

| Code | Condition |
|---|---|
| 400 | Unsupported crop name |
| 404 | District not found in 64-district dataset |
| 404 | No baseline available for crop/district combo |

---

## `POST /api/yield/predict`

**Purpose:** Run XGBoost inference for a crop yield scenario.

**Request Body:**
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

**Field Constraints:**

| Field | Type | Min | Max | Notes |
|---|---|---|---|---|
| `crop` | enum | — | — | One of: Aman, Aus, Boro, Jute, Potato |
| `district` | string | 2 chars | 64 chars | Must be one of 64 known districts |
| `year` | int | 1984 | 2040 | — |
| `tmax_mean_c` | float | -5 | 55 | Mean max temperature (°C) |
| `tmin_mean_c` | float | -10 | 45 | Mean min temperature (°C) |
| `rain_total_mm` | float | 0 | 10,000 | Total rainfall (mm) |
| `vapour_pressure_hpa` | float | 0 | 100 | Vapour pressure (hPa) |
| `cloud_mean_okta` | float | 0 | 8 | Mean cloud cover (okta) |
| `wet_days` | float | 0 | 200 | Number of wet days |

**Response (200):**
```json
{
  "crop": "Boro",
  "district": "Gazipur",
  "scenario_year": 2027,
  "predicted_yield": 1.645321,
  "yield_unit": "t/acre",
  "model_name": "XGBoost Regressor",
  "model_artifact": "boro_xgboost.json",
  "benchmark": {
    "mae": 0.1187,
    "rmse": 0.1505,
    "r2": 0.4315,
    "train_rows": 2048,
    "test_rows": 512,
    "train_period": "1984-2015",
    "test_period": "2016-2023"
  },
  "model_comparison": [
    {"model": "XGBoost", "mae": 0.1187, "rmse": 0.1505, "r2": 0.4315},
    {"model": "Random Forest", "mae": 0.1265, "rmse": 0.1604, "r2": 0.3540}
  ],
  "selected_model_reason": "Lowest RMSE among the two supplied candidate models for this crop.",
  "reliability_flag": "positive_historical_signal",
  "climate_source": "User-edited scenario based on CRU TS crop-season variables",
  "feature_values": { "year": 2027, "tmax_mean_c": 29.99, "...": "..." },
  "disclaimer": "District-level historical scenario estimate. Not an official forecast or a guaranteed farm-level yield."
}
```

**Reliability Flags:**
- `positive_historical_signal` — R² > 0 on held-out test set
- `weak_historical_skill` — R² < 0 (model is worse than mean baseline)

**Error Responses:**

| Code | Condition |
|---|---|
| 400 | Unknown district |
| 422 | Validation error (out-of-range values, missing fields) |
| 500 | XGBoost inference failure |

---

## CORS Configuration

| Variable | Default |
|---|---|
| `AGRO_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` |

Comma-separated list of allowed origins. Set in `.env` or Docker environment.

---

## Future API Endpoints (Planned)

| Endpoint | Purpose | Priority |
|---|---|---|
| `POST /api/chat` | AgriBot Gemini proxy | High |
| `GET /api/weather/{district}` | Live weather data | High |
| `POST /api/disease/scan` | Disease image classification | Medium |
| `CRUD /api/farms` | Farm management | Medium |
| `CRUD /api/products` | Marketplace products | Medium |
| `CRUD /api/orders` | Order management | Medium |
| `GET /api/ndvi/{district}` | Satellite vegetation index | Low |
| `POST /api/auth/login` | Authentication | Critical |

---

*Last updated: 2026-11-20*
