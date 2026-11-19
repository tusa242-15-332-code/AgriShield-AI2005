# AgriShield AI Architecture

## Current working yield-prediction flow

```text
React + Vite frontend
        |
        | HTTPS/JSON request
        v
FastAPI backend
        |
        +--> Request validation (crop, district, year, climate features)
        |
        +--> CRU TS crop-season baseline lookup (64 districts)
        |
        +--> Fitted preprocessing schema
        |       - numeric feature order + training medians
        |       - district one-hot category order
        |
        +--> Crop-specific XGBoost Booster (native JSON)
        |
        +--> Saved temporal test metrics
        |
        v
Prediction + unit + benchmark + reliability note
        |
        v
React result and model transparency panel
```

## Model feature contract

Input order is saved in each model schema:

1. `year`
2. `tmax_mean_c`
3. `tmin_mean_c`
4. `rain_total_mm`
5. `vapour_pressure_hpa`
6. `cloud_mean_okta`
7. `wet_days`
8. `district` (one-hot encoded with the exact fitted 64-district category order)

The backend uses the original fitted category ordering and numeric imputation medians. It sends a sparse matrix to XGBoost. The sparse layout is important because converting this matrix to dense form changes the treatment of zero-valued entries in XGBoost.

## Model routing

Each crop has its own regressor because Jute yield is measured in bales/acre while the other four crops are measured in tonnes/acre.

| Crop | Deployed model |
|---|---|
| Aman | `aman_xgboost.json` |
| Aus | `aus_xgboost.json` |
| Boro | `boro_xgboost.json` |
| Jute | `jute_xgboost.json` |
| Potato | `potato_xgboost.json` |

## API contract

- `GET /health`
- `GET /api/yield/meta`
- `GET /api/yield/baseline?crop={crop}&district={district}`
- `POST /api/yield/predict`

The FastAPI service has configurable CORS origins through `AGRO_ALLOWED_ORIGINS`.

## Production architecture still required

Before public production use, add managed authentication, role-based authorization, a real database, request logging, rate limiting, model/version registry, monitoring, backups, HTTPS, and server-side secrets management. Integrations for live weather, farm sensors, satellite imagery and payments require their own providers and credentials.
