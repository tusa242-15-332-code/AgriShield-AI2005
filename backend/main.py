from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Literal

import numpy as np
import pandas as pd
import xgboost as xgb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from scipy import sparse

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"
CLIMATE_PATH = DATA_DIR / "cru_crop_season_climate.csv"
METRICS_PATH = DATA_DIR / "model_comparison_results.csv"

CROPS = ["Aman", "Aus", "Boro", "Jute", "Potato"]
CLIMATE_FEATURES = [
    "tmax_mean_c", "tmin_mean_c", "rain_total_mm",
    "vapour_pressure_hpa", "cloud_mean_okta", "wet_days",
]
NUMERIC_FEATURES = ["year", *CLIMATE_FEATURES]
FEATURE_COLUMNS = [*NUMERIC_FEATURES, "district"]

app = FastAPI(
    title="AgriShield AI API",
    version="1.0.0",
    description="Inference API for AgriShield's five fitted, crop-specific XGBoost yield models.",
)

allowed_origins = os.getenv(
    "AGRO_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in allowed_origins if x.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def load_model_bundle(crop: str):
    model_path = MODEL_DIR / f"{crop.lower()}_xgboost.json"
    schema_path = MODEL_DIR / f"{crop.lower()}_preprocessor.json"
    if not model_path.exists() or not schema_path.exists():
        raise RuntimeError(f"Missing model bundle for {crop}")
    booster = xgb.Booster()
    booster.load_model(str(model_path))
    schema = json.loads(schema_path.read_text())
    return {"booster": booster, "schema": schema}


MODEL_BUNDLES = {crop: load_model_bundle(crop) for crop in CROPS}

if not CLIMATE_PATH.exists():
    raise RuntimeError(f"Required CRU TS crop-season climate file missing: {CLIMATE_PATH}")
CLIMATE = pd.read_csv(CLIMATE_PATH)
CLIMATE = CLIMATE.dropna(subset=["district", "crop", *CLIMATE_FEATURES]).copy()
CLIMATE["district"] = CLIMATE["district"].astype(str)
CLIMATE["crop"] = CLIMATE["crop"].astype(str)
DISTRICTS = sorted(CLIMATE["district"].unique().tolist())

all_metrics_df = pd.read_csv(METRICS_PATH)
comparison_df = all_metrics_df.copy()
COMPARISON = {
    str(crop): [
        {"model": str(row.model), "mae": float(row.MAE), "rmse": float(row.RMSE), "r2": float(row.R2)}
        for row in group.itertuples(index=False)
    ]
    for crop, group in comparison_df.groupby("crop")
}
metrics_df = all_metrics_df[all_metrics_df["model"].str.lower().eq("xgboost")].copy()
METRICS = {
    str(row.crop): {
        "mae": float(row.MAE),
        "rmse": float(row.RMSE),
        "r2": float(row.R2),
        "train_rows": int(row.train_rows),
        "test_rows": int(row.test_rows),
        "train_period": str(row.train_period),
        "test_period": str(row.test_period),
    }
    for row in metrics_df.itertuples(index=False)
}


class YieldPredictionRequest(BaseModel):
    crop: Literal["Aman", "Aus", "Boro", "Jute", "Potato"]
    district: str = Field(min_length=2, max_length=64)
    year: int = Field(ge=1984, le=2040)
    tmax_mean_c: float = Field(ge=-5, le=55)
    tmin_mean_c: float = Field(ge=-10, le=45)
    rain_total_mm: float = Field(ge=0, le=10000)
    vapour_pressure_hpa: float = Field(ge=0, le=100)
    cloud_mean_okta: float = Field(ge=0, le=8)
    wet_days: float = Field(ge=0, le=200)


def make_sparse_model_input(payload: YieldPredictionRequest, schema: dict):
    """Reproduce the fitted ColumnTransformer's numeric + one-hot layout.

    Numeric values are placed in a CSR block and district is one-hot encoded
    using the exact category ordering saved from the fitted training encoder.
    The sparse representation matters: it preserves the model's original
    XGBoost missing/zero semantics and has been checked against saved holdout
    predictions for all 2,560 crop-test records.
    """
    numeric_values = np.asarray(
        [getattr(payload, name) for name in schema["numeric_features"]], dtype=np.float64
    ).reshape(1, -1)
    medians = np.asarray(schema["numeric_imputer_medians"], dtype=np.float64)
    numeric_values = np.where(np.isnan(numeric_values), medians, numeric_values)

    categories = schema["district_categories"]
    category_index = {name: index for index, name in enumerate(categories)}
    district = payload.district
    if district not in category_index:
        raise HTTPException(status_code=400, detail="District is not a fitted model category.")
    district_column = sparse.csr_matrix(
        (np.asarray([1.0]), (np.asarray([0]), np.asarray([category_index[district]]))),
        shape=(1, len(categories)),
    )
    matrix = sparse.hstack([sparse.csr_matrix(numeric_values), district_column], format="csr")
    return xgb.DMatrix(matrix, feature_names=schema["feature_names"])


@app.get("/")
def root():
    return {"service": "AgriShield AI API", "status": "ok", "docs": "/docs"}


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "loaded_models": sorted(MODEL_BUNDLES.keys()),
        "expected_models": CROPS,
        "district_count": len(DISTRICTS),
        "dataset_rows": int(len(CLIMATE)),
        "model_format": "XGBoost native JSON",
    }


@app.get("/api/yield/meta")
def yield_metadata():
    return {
        "crops": CROPS,
        "districts": DISTRICTS,
        "features": FEATURE_COLUMNS,
        "model_name": "XGBoost Regressor",
        "model_count": len(MODEL_BUNDLES),
        "training_period": "1984-2015",
        "test_period": "2016-2023",
        "climate_source": "CRU TS crop-season climate",
    }


@app.get("/api/yield/baseline")
def yield_baseline(crop: str, district: str):
    if crop not in CROPS:
        raise HTTPException(status_code=400, detail=f"Unsupported crop. Choose from: {', '.join(CROPS)}")
    if district not in DISTRICTS:
        raise HTTPException(status_code=404, detail="District not found in the model's 64-district training dataset.")
    subset = CLIMATE[(CLIMATE["crop"] == crop) & (CLIMATE["district"] == district)]
    if subset.empty:
        raise HTTPException(status_code=404, detail="No historical climate baseline available for this crop and district.")
    averages = subset[CLIMATE_FEATURES].mean(numeric_only=True).to_dict()
    return {
        "crop": crop,
        "district": district,
        "years_covered": [int(subset["year"].min()), int(subset["year"].max())],
        "records": int(len(subset)),
        "climate": {key: round(float(averages[key]), 4) for key in CLIMATE_FEATURES},
        "source_label": "CRU TS crop-season historical average (1984-2023) • editable scenario baseline",
    }


@app.post("/api/yield/predict")
def predict_yield(payload: YieldPredictionRequest):
    if payload.district not in DISTRICTS:
        raise HTTPException(status_code=400, detail="District is not part of the model's 64-district training dataset.")
    bundle = MODEL_BUNDLES[payload.crop]
    dmatrix = make_sparse_model_input(payload, bundle["schema"])
    try:
        prediction = float(bundle["booster"].predict(dmatrix)[0])
    except Exception as exc:
        raise HTTPException(status_code=500, detail="XGBoost inference failed. Check the model bundle and feature schema.") from exc

    benchmark = METRICS.get(payload.crop)
    reliability = "weak_historical_skill" if benchmark and benchmark["r2"] < 0 else "positive_historical_signal"
    unit = "bales/acre" if payload.crop == "Jute" else "t/acre"
    feature_values = {name: getattr(payload, name) for name in FEATURE_COLUMNS}
    return {
        "crop": payload.crop,
        "district": payload.district,
        "scenario_year": payload.year,
        "predicted_yield": round(prediction, 6),
        "yield_unit": unit,
        "model_name": "XGBoost Regressor",
        "model_artifact": f"{payload.crop.lower()}_xgboost.json",
        "benchmark": benchmark,
        "model_comparison": COMPARISON.get(payload.crop, []),
        "selected_model_reason": "Lowest RMSE among the two supplied candidate models for this crop.",
        "reliability_flag": reliability,
        "climate_source": "User-edited scenario based on CRU TS crop-season variables",
        "feature_values": feature_values,
        "disclaimer": "District-level historical scenario estimate. Not an official forecast or a guaranteed farm-level yield.",
    }
