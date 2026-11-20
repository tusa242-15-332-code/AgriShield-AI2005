# 📊 Data Lineage & Provenance

## Dataset Summary

| Dataset | File | Rows | Coverage |
|---|---|---|---|
| CRU TS Crop-Season Climate | `backend/data/cru_crop_season_climate.csv` | 12,800 | 64 districts × 5 crops × 40 years (1984–2023) |
| Model Comparison Results | `backend/data/model_comparison_results.csv` | 10 | 5 crops × 2 models |
| Best Model Per Crop | `backend/data/best_model_per_crop.csv` | 5 | Selected model per crop |
| Test Set Predictions | `backend/data/test_set_predictions.csv` | ~2,560 | Held-out predictions for validation |
| Experiment Config | `backend/data/experiment_config.json` | — | Training hyperparameters |

---

## Primary Data Sources

### 1. Crop Statistics — Bangladesh Bureau of Statistics (BBS)
- **Content:** Area (acres), production (tonnes or bales), yield per acre
- **Crops:** Aus rice, Aman rice, Boro rice, Jute, Potato
- **Coverage:** 64 districts, ~40 years
- **Sources:**
  - *45 Years Agriculture Statistics of Major Crops* (up to 2014–15)
  - *Yearbook of Agricultural Statistics* (later years)
- **License:** Likely government open data; verify before commercial use

### 2. Climate Data — CRU TS 4.10 (Crop-Season Layer)
- **Content:** 6 crop-season climate variables per district
- **Features used:** `tmax_mean_c`, `tmin_mean_c`, `rain_total_mm`, `vapour_pressure_hpa`, `cloud_mean_okta`, `wet_days`
- **Coverage:** 1983–2023, monthly grids aggregated to crop seasons
- **Source:** Climatic Research Unit, University of East Anglia (Harris et al. 2020, Sci. Data 7:109)
- **License:** Open Database License 1.0 (ODbL)
- **DOI:** 10.17632/czp77g2kpp.1

### 3. Station Weather — Bangladesh Meteorological Department (BMD)
- **1984–2013:** From Kaggle compilation (emonreza, 2019; GPL-2)
- **2014–2023:** Purchased from BMD — **NOT redistributable** (cells empty in public dataset)
- **Note:** This project uses the CRU TS layer for model features, not the BMD station data

---

## Licensing Matrix

| Component | License | Redistribution OK? |
|---|---|---|
| Crop statistics, metadata, scripts | CC BY 4.0 | ✅ Yes, with attribution |
| CRU TS derived data | ODbL 1.0 | ✅ Yes, with CRU attribution |
| Station climate 1984–2013 | GPL-2 | ✅ Yes, under GPL-2 |
| Station climate 2014–2023 | BMD restricted | ❌ Not included, not redistributable |

> [!CAUTION]
> Review all licensing terms in `backend/data/dataset_README.md` before any public hosting or redistribution of the data files.

---

## Data Quality Notes

### Known Limitations
1. **Station sharing:** Up to 6 districts share one BMD station (e.g., Dhaka, Jessore). These districts have identical climate values.
2. **Station location ≠ District location:** Climate columns describe the station, not the district centroid. 39 of 64 districts use a neighbouring station.
3. **Gap filling:** The 1984–2013 Kaggle compilation filled BMD station gaps with an unspecified method. Filled values are not flagged.
4. **CRU TS is gridded/interpolated:** Not direct observations. Uses fixed crop-season windows.
5. **Year labeling:** "Year" is the harvest calendar year — Aus/Aman/Jute use the first year of the BBS agricultural year; Boro/Potato use the second.

### Quality Control Checks (from dataset README)
- ✅ No missing values in crop records
- ✅ No duplicate district-years
- ✅ All 64 districts present in all 40 years
- ✅ Positive area and production values
- ✅ Yields = production / area (verified)
- ⚠️ 3 flagged outliers (Aus: Comilla 2019–2020, Feni 2020) — kept as valid trend

### External Validation
- National totals correlate with FAOSTAT (r = 0.992 rice, 0.993 potato)
- CRU rainfall correlates at r = 0.72 with station data
- Known disasters (1988 flood, 1998 flood, Cyclone Sidr 2007, 2017 haor flood) confirmed in data

---

## Data Pipeline — Current State

```
                    CURRENT (Static)
┌──────────────────────────────────────────┐
│  Pre-processed CSV files on disk         │
│  └── Loaded at FastAPI startup           │
│      └── Pandas DataFrame in memory      │
│          └── Served via API endpoints    │
└──────────────────────────────────────────┘
```

## Data Pipeline — Target State

```
                    FUTURE (Dynamic)
┌─────────────┐    ┌──────────────┐    ┌────────────────┐
│ BBS Annual  │───▶│  ETL Pipeline │───▶│  PostgreSQL /  │
│ Release     │    │  (Airflow)    │    │  BigQuery      │
├─────────────┤    │              │    ├────────────────┤
│ BMD/CRU     │───▶│  Validate    │───▶│  Feature Store │
│ Updates     │    │  Transform   │    │  (Feast)       │
├─────────────┤    │  Quality Chk │    ├────────────────┤
│ OpenWeather │───▶│              │───▶│  Cache (Redis) │
│ Live Feed   │    └──────────────┘    └────────┬───────┘
└─────────────┘                                 │
                                                ▼
                                     ┌──────────────────┐
                                     │  FastAPI + ML     │
                                     │  Inference Engine  │
                                     └──────────────────┘
```

---

## Citation Requirements

When using this data in publications:
1. Cite the Mendeley Data DOI: `10.17632/czp77g2kpp.1`
2. Cite BBS crop statistics publications
3. Cite BMD as the original station data source
4. Cite the Kaggle compilation (emonreza, 2019)
5. Cite CRU TS 4.10 (Harris et al. 2020, Scientific Data 7:109)

---

*Last updated: 2026-11-20*
