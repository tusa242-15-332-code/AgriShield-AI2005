# Build and Test Report

## Backend API tests

Executed from `backend/` with `pytest -q`.

**Result: 4 passed.**

Coverage:
- API health reports five loaded XGBoost models, 64 districts and 12,800 climate rows.
- All five crop-specific models return a prediction when seeded with a district/crop historical CRU TS baseline.
- Jute returns bales/acre while Aman, Aus, Boro and Potato return tonnes/acre.
- Unknown districts are rejected.
- Prediction responses include Random Forest vs XGBoost held-out metrics, and the selected XGBoost model has lower RMSE for Boro.

## Model conversion parity

All 512 saved XGBoost test predictions per crop were compared with predictions from the exported native JSON model and saved preprocessing schema. Maximum absolute difference per crop was below `9e-16`.

## Frontend source syntax

The full `App.tsx` source was transpiled with the installed TypeScript compiler in TSX/ES2022 mode. Result: **0 syntax diagnostics**.

## Not executed in this environment

A complete Vite production build was not run because frontend npm dependencies were not installed and the environment could not reach the package registry. On a normal development machine, run `npm install` and `npm run build` in `frontend/` before the final judge presentation. Docker build likewise requires registry access to pull base images and npm packages.
