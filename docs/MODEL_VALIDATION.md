# Crop Yield Model Validation Report

## Experiment design from the supplied training notebook

- Dataset: Bangladesh district-level crop yield records joined with CRU TS crop-season climate data.
- Coverage: 64 districts, five crops, 1984–2023, 12,800 crop records.
- Separate regressors were trained for Aman, Aus, Boro, Jute and Potato.
- Features: year, district and six crop-season climate variables.
- Models compared: Random Forest Regressor and XGBoost Regressor.
- Training period: 1984–2015 (2,048 records per crop).
- Held-out temporal test period: 2016–2023 (512 records per crop).
- Metrics: MAE, RMSE and R².

## Saved test metrics

The values below are from `model_comparison_results.csv` in the supplied model output archive. Lower MAE/RMSE is better. Higher R² is better.

| Crop | Selected model | MAE | RMSE | R² | Test rows |
|---|---:|---:|---:|---:|---:|
| Aman | XGBoost | 0.1074 | 0.1393 | 0.0431 | 512 |
| Aus | XGBoost | 0.1578 | 0.1896 | -0.4226 | 512 |
| Boro | XGBoost | 0.1187 | 0.1505 | 0.4315 | 512 |
| Jute | XGBoost | 0.3126 | 0.3987 | 0.5916 | 512 |
| Potato | XGBoost | 0.8712 | 1.0716 | 0.3410 | 512 |

Jute errors are in bales/acre. The other crop errors are in tonnes/acre. Metrics should not be compared across crops without accounting for these different units and yield scales.

## Why XGBoost is used in the live inference endpoint

The saved best-model table chooses XGBoost for all five crops. Its RMSE is lower than the corresponding Random Forest RMSE for every crop in the supplied experiment. The Random Forest metrics remain available in `backend/data/model_comparison_results.csv` for comparison, but the live API routes to the five selected XGBoost models.

## Portable model conversion validation

The uploaded fitted sklearn/XGBoost joblib pipelines were converted to XGBoost native JSON models plus explicit preprocessing schemas. The converted model was checked against the saved XGBoost holdout predictions for all 512 test records in each crop (2,560 predictions total). Maximum absolute difference per crop was below `9e-16`, i.e. floating-point rounding only. This verifies that the portable API model preserves the supplied saved predictions for the held-out records.

## Interpretation and limitations

- Aman R² is only 0.0431, indicating very limited explained variation on the held-out period.
- Aus R² is negative (-0.4226), meaning the model performs worse than a simple test-set mean baseline under the R² definition. Its output must be presented as exploratory, not reliable.
- Boro, Jute and Potato have positive historical R², but this does not guarantee future performance or farm-level accuracy.
- Inputs are district-level and gridded/interpolated climate indicators, not plot-level sensor readings.
- Scenario years beyond 2023 are outside the held-out test window. The model can produce a number, but extrapolation is not validated by the supplied experiment.
- The CRU TS crop-season baseline is historical climate context, not a live forecast. The current frontend lets users edit those values to create scenarios.
- No prediction confidence interval was supplied by the original experiment; the UI does not fabricate one.

## Dataset documentation caveats

The included dataset README notes that 2014–2023 purchased BMD station values are not included for redistribution. The crop-season CRU TS data is used by the training notebook for model features. The README also documents station assignment and climate-source limitations. See `backend/data/dataset_README.md` and the included `docs/research_assets/dataset_upload.zip` for source documentation and the original data package.
