# 🤖 ML Model Registry

## Model Inventory

### Deployed Models (XGBoost — Live Inference)

| Crop | Model File | Preprocessor | Size | Unit |
|---|---|---|---|---|
| Aman | `aman_xgboost.json` | `aman_preprocessor.json` | 873 KB / 3.9 KB | t/acre |
| Aus | `aus_xgboost.json` | `aus_preprocessor.json` | 899 KB / 3.9 KB | t/acre |
| Boro | `boro_xgboost.json` | `boro_preprocessor.json` | 862 KB / 3.9 KB | t/acre |
| Jute | `jute_xgboost.json` | `jute_preprocessor.json` | 863 KB / 3.9 KB | bales/acre |
| Potato | `potato_xgboost.json` | `potato_preprocessor.json` | 868 KB / 3.9 KB | t/acre |

### Non-Deployed Models (Random Forest — Benchmarks Only)

Random Forest regressors were trained alongside XGBoost but had higher RMSE for every crop. Their artifacts are referenced in `model_comparison_results.csv` but are **not loaded** by the live API.

---

## Training Configuration

```json
{
  "target": "yield",
  "features": ["year", "tmax_mean_c", "tmin_mean_c", "rain_total_mm",
               "vapour_pressure_hpa", "cloud_mean_okta", "wet_days", "district"],
  "climate_source": "CRU TS crop-season climate",
  "train_period": "1984-2015",
  "test_period": "2016-2023",
  "models": ["Random Forest Regressor", "XGBoost Regressor"],
  "random_state": 42
}
```

- **Train set:** 2,048 records per crop (32 years × 64 districts)
- **Test set:** 512 records per crop (8 years × 64 districts)
- **Split method:** Temporal (chronological), not random
- **Total dataset:** 12,800 records across 5 crops

---

## Test Metrics (Held-Out 2016–2023)

| Crop | Model | MAE | RMSE | R² | Verdict |
|---|---|---|---|---|---|
| **Aman** | XGBoost | 0.1074 | 0.1393 | 0.0431 | ⚠️ Near-zero signal |
| Aman | Random Forest | 0.1166 | 0.1504 | -0.1147 | ❌ Worse than mean |
| **Aus** | XGBoost | 0.1578 | 0.1896 | -0.4226 | ❌ Worse than mean |
| Aus | Random Forest | 0.1566 | 0.1898 | -0.4248 | ❌ Worse than mean |
| **Boro** | XGBoost | 0.1187 | 0.1505 | 0.4315 | ✅ Moderate signal |
| Boro | Random Forest | 0.1265 | 0.1604 | 0.3540 | ✅ Weaker but positive |
| **Jute** | XGBoost | 0.3126 | 0.3987 | 0.5916 | ✅ Good signal |
| Jute | Random Forest | 0.3342 | 0.4213 | 0.5440 | ✅ Decent |
| **Potato** | XGBoost | 0.8712 | 1.0716 | 0.3410 | ✅ Moderate signal |
| Potato | Random Forest | 1.0009 | 1.2404 | 0.1170 | ⚠️ Weak |

> [!WARNING]
> **Aus model (R² = -0.42)** performs worse than predicting the test-set mean. It should be flagged transparently in the UI (currently done via `reliability_flag`).
> **Aman model (R² = 0.04)** explains only ~4% of variance — practically no predictive power.

---

## Model Conversion Validation

The original sklearn/XGBoost joblib pipelines were converted to native XGBoost JSON + explicit preprocessing schemas. Validation results:

| Crop | Test Records | Max Abs Difference |
|---|---|---|
| Aman | 512 | < 9e-16 |
| Aus | 512 | < 9e-16 |
| Boro | 512 | < 9e-16 |
| Jute | 512 | < 9e-16 |
| Potato | 512 | < 9e-16 |

**Conclusion:** Portable model preserves predictions to floating-point precision. ✅

---

## Preprocessor Schema Structure

Each `{crop}_preprocessor.json` contains:

```json
{
  "numeric_features": ["year", "tmax_mean_c", "tmin_mean_c", ...],
  "numeric_imputer_medians": [2000.0, 30.5, 19.2, ...],
  "district_categories": ["Bagerhat", "Bandarban", "Barguna", ...],
  "feature_names": ["year", "tmax_mean_c", ..., "Bagerhat", "Bandarban", ...]
}
```

> [!IMPORTANT]
> The `district_categories` order must match the fitted training encoder exactly. Retraining requires regenerating these schemas.

---

## Retraining Plan

### Phase 1: Improve Weak Models
- [ ] **Aus rice:** Investigate why R² is negative — possible structural break in post-2015 Aus yields (policy/varietal changes)
- [ ] **Aman rice:** Add engineered features (monsoon intensity indices, flood indicators, lag variables)
- [ ] Try alternative models: LightGBM, CatBoost, neural nets

### Phase 2: Feature Engineering
- [ ] Add lag features (previous year's yield)
- [ ] Add trend variables (rolling 3-year/5-year district yield average)
- [ ] Incorporate soil data if available (soil type, pH, organic matter)
- [ ] Use actual growing-season weather instead of full-season averages

### Phase 3: Model Upgrade
- [ ] Hyperparameter tuning (Optuna/Bayesian optimization)
- [ ] Ensemble methods (stacking XGBoost + RF + LightGBM)
- [ ] Prediction intervals via quantile regression or conformal prediction
- [ ] Model versioning with MLflow

### Phase 4: Live Integration
- [ ] Real-time weather feeds replacing CRU TS baselines
- [ ] Automated retraining pipeline triggered by new BBS data releases
- [ ] A/B testing framework for model comparison in production

---

*Last updated: 2026-11-20*
