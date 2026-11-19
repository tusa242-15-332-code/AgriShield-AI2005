# Integrating crop statistics, weather stations and gridded climate: a machine learning dataset for yield prediction in Bangladesh

Area, production and yield of five crops (Aus, Aman and Boro rice, jute and potato) for all 64 districts of Bangladesh, joined to annual values from the Bangladesh Meteorological Department (BMD) station assigned to each district and to climate over each crop's growing season from CRU TS 4.10. The dataset covers 40 harvest years, giving 2,560 district-years per crop and 12,800 crop records. It accompanies a *Data in Brief* article of the same title.

## Sources

| Component | Years | Source |
|---|---|---|
| Climate | 1984-2013 | BMD station records, taken from the Kaggle compilation "65 Years of Weather Data Bangladesh Preprocessed" (emonreza, 2019; covers 1948-2013; GPL-2): https://www.kaggle.com/datasets/emonreza/65-years-of-weather-data-bangladesh-preprocessed |
| Climate | 2014-2023 | **Not included.** BMD station records purchased from the BMD climate data portal (https://dataportal.bmd.gov.bd/web/) by a colleague of the authors; BMD's terms do not allow redistribution, so these cells are empty (`climate_source = bmd_not_included`). Users can buy them from BMD and insert them |
| Crops | to 2014-15 | Bangladesh Bureau of Statistics (BBS), *45 Years Agriculture Statistics of Major Crops (Aus, Amon, Boro, Jute, Potato and Wheat)* |
| Crops | later years | BBS, *Yearbook of Agricultural Statistics* (various issues) |
| Crop-season climate | 1983-2023 | CRU TS 4.10 monthly grids (Harris et al. 2020, Sci. Data 7:109), Open Database License |

The `year` label is the harvest calendar year: Aus, Aman and jute carry the first year of the BBS agricultural year, Boro and potato the second. This was confirmed for Aman and Boro from the 1998 monsoon flood and the April 2017 haor flash flood, is supported for jute (production fell 36 % in the record labelled 1988, the flood year) and potato (best agreement with FAOSTAT in the same year), and is consistent for Aus.

The column `climate_source` marks the 1984-2013 station values from the Kaggle compilation (`kaggle_compilation`) and the empty 2014-2023 rows (`bmd_not_included`). The crop data and the CRU TS layer cover all of 1984-2023.

## Folder structure

```
data/
  original/                       the five files as compiled from the sources (unchanged)
    Final_data - Aman.csv
    Final_data - Aus.csv
    Final_data - Boro2.csv
    Final_data - Jute.csv
    Final_data - Potato.csv
  processed/                      the same values, unit-labelled
    climate_by_district_year.csv  climate and station location, 2,560 rows
    crop_aman.csv                 2,560 rows each
    crop_aus.csv
    crop_boro.csv
    crop_jute.csv
    crop_potato.csv
    crop_climate_long.csv         all crops stacked with climate, 12,800 rows
    crop_climate_wide.csv         one row per district-year, all crops, 2,560 rows
    cru_crop_season_climate.csv   CRU TS climate over each crop's season, 12,800 rows
    cru_monthly_by_district.csv   CRU TS monthly climate per district, 1983-2023, 31,488 rows
metadata/
  data_dictionary.csv             every column: meaning, unit, source
  district_station_mapping.csv    the BMD station assigned to each district
  district_centroids.csv          district centres (geoBoundaries ADM2)
  crop_seasons.csv                season windows of the CRU layer
  summary_statistics.csv          n, mean, sd, min, quartiles, max of every variable
  national_totals_by_year.csv     national area, production and yield per crop and year
  qc_report.md                    quality-control checks and results
  qc_yield_flags.csv              yields far from their district median (kept)
  qc_climate_flags.csv            station-years far from CRU TS (kept)
  checksums_sha256.txt            SHA-256 of every file in data/, metadata/ and scripts/
scripts/
  build_package.py                rebuilds processed/ and metadata/ from original/
  make_figures_tables.py          figures, tables and FAOSTAT comparison for the article
  fetch_external.py               downloads CRU TS, NOAA GSOD, USDA PSD and GDHY (not redistributed)
  add_external_layers.py          builds the CRU crop-season layer
  validate_external.py            validation against GSOD, CRU TS, USDA, disasters and GDHY
  benchmark.py                    yield-prediction example (scikit-learn)
```

Use `crop_climate_long.csv` for models across crops and `crop_climate_wide.csv` for one row per district-year. The per-crop files and `climate_by_district_year.csv` join on `district` and `year`; `cru_crop_season_climate.csv` joins the long file on `district`, `year` and `crop`.

## Variables and units

Full definitions are in `metadata/data_dictionary.csv`.

| Variable | Unit | Notes |
|---|---|---|
| `area_acres` | acres | cultivated area |
| `production_t` | metric tonnes | Aus, Aman and Boro as clean (milled) rice; potato |
| `production_bales` | bales of 180 kg | jute |
| `yield_*` | production unit per acre | production divided by area |
| `max_temp_upper_c` | °C | **Warning: not the mean daily maximum.** The compiled "Max Temp" field is 2.8 °C above the mean daily maximum and close to the mean of each month's five hottest days, so it behaves like an upper-tail statistic (renamed from `max_temp_c`) |
| `min_temp_c` | °C | annual mean of monthly mean daily minimum |
| `rainfall_mm` | mm per month | annual mean of monthly totals (multiply by 12 for the annual total) |
| `relative_humidity_pct` | % | annual mean |
| `wind_speed` | as recorded by BMD | annual mean; the source compilation does not state the unit |
| `cloud_coverage_okta` | okta (0-8) | annual mean |
| `bright_sunshine_hours` | hours per day | annual mean |
| `latitude`, `longitude`, `altitude_m` | degrees, m | location of the weather station, not of the district |
| `x_btm_m`, `y_btm_m` | m | station coordinates, Bangladesh Transverse Mercator (EPSG:3106) |

Area, production and jute units were confirmed by comparing national totals with FAOSTAT: area is 2.48 to 2.49 times FAOSTAT hectares for every crop, potato production is 1.056 times FAOSTAT tonnes, jute bales multiplied by 0.18 t are 0.940 times FAOSTAT tonnes, and rice is 0.675 times FAOSTAT paddy.

Boro is supplied in two units: `production_t` (metric tonnes) and `production_short_tons` (metric tonnes multiplied by 1.10231131), with `yield_short_tons_per_acre` computed from the latter as in the compiled file. `yield_t_per_acre` was added so the three rice seasons share one unit, and the long file uses the metric values.

## District-station link

Each district uses one station in every year. The authors assigned each district the station they judged nearest when compiling the files. Twenty-five districts contain a station and use it. The other 39 use a station in a neighbouring district: for 30 of them it is the station nearest to the district centre, and for nine it is between 0.4 and 35.6 km farther than the nearest. Up to six districts share one station (Dhaka and Jessore), and districts sharing a station have identical climate values. `district_station_mapping.csv` also gives the station nearest to each district centre (`nearest_station`), so users can switch; every station's values appear in the climate file under the districts assigned to it.

## Processing

No value from the compiled files was changed. Processing:

1. Write the climate block, identical in all five compiled files, once.
2. Rename columns to lower-case names that include the unit.
3. Drop `SL. NO` (row number), `Period` (year plus 0.01) and `Month` (Aus file only, always 1); they remain in `data/original/`.
4. Add Boro `yield_t_per_acre`.
5. Build the long and wide files.

`scripts/build_package.py` repeats these steps and checks that every processed value equals the original exactly:

```
python3 scripts/build_package.py data/original .
```

## Quality control and validation

`metadata/summary_statistics.csv` and `metadata/qc_report.md` were computed by the authors from the full records, including the 2014-2023 station values; rebuilding from these files gives station climate statistics for 1984-2013 only. All checks in `metadata/qc_report.md` pass: no missing values, no duplicate district-years, all 64 districts in all 40 years, positive area and production, and supplied yields equal to production divided by area. A robust outlier screen flagged 3 of 12,800 yields (Aus: Comilla 2019 and 2020, Feni 2020); they lie at the top of a steady rise and were kept.

Crop records: national totals agree with FAOSTAT in level (r = 0.992 rice, 0.993 potato, 0.848 jute production) and with independent USDA rice estimates (r = 0.990). Much of this reflects shared trends; correlations of year-to-year changes are 0.63 (rice), 0.39 (potato) and 0.33 (jute) against FAOSTAT and 0.48 against USDA. Four documented disasters appear in the expected districts and years (1988 and 1998 floods, Cyclone Sidr 2007, haor flash flood 2017). GDHY grid yields give only weak support at district level.

Station climate (authors' analysis of the full 1984-2023 records): compared with NOAA GSOD reports from the same stations and with CRU TS 4.10, levels agree (CRU rainfall r = 0.72, +5.9 %; minimum temperature bias about 0 °C), but `max_temp_upper_c` is 2.8-3.0 °C above the mean daily maximum at every station, year-to-year anomalies agree weakly (detrended r about -0.1 to 0.2), and temperatures in 2014-2023 are 0.5-0.7 °C higher relative to CRU TS than in 1984-2013. Use the station columns for differences between places and long-term means, and the CRU layer for year-to-year analyses.

## Known limitations

- Station climate values are calendar-year values; see the validation notes above. The CRU layer gives crop-season values but is an interpolated grid and uses fixed season windows.
- Districts that share a station have identical climate values, and the location columns describe the station.
- The 1984-2013 climate values come from a compilation whose author filled gaps in the BMD records with an unspecified method; the filled values are not identified.
- Wheat is in the BBS source but not in this dataset.

## Licence

The repository is licensed by component:

| Component | Licence |
|---|---|
| Crop files, metadata, documentation and scripts | CC BY 4.0 |
| `cru_crop_season_climate.csv`, `cru_monthly_by_district.csv` (derived from CRU TS 4.10) | Open Database License 1.0 (ODbL), as required by CRU TS; attribution: Climatic Research Unit, University of East Anglia |
| Station climate values for 1984-2013 (`climate_source = kaggle_compilation`) | GPL-2, as inherited from the Kaggle compilation |
| Station climate values for 2014-2023 | Not included (purchased BMD data; BMD terms restrict redistribution) |

## Citation

Please cite this dataset (Mendeley Data, doi:10.17632/czp77g2kpp.1) and the accompanying *Data in Brief* article, together with BBS, BMD, the Kaggle compilation and CRU TS (Harris et al. 2020) as the original sources.
