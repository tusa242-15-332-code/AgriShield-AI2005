# 📊 Module Status Matrix

> This document tracks the maturity and integration status of every AgriShield module. Use this to plan development priorities and set honest demo expectations.

---

## Status Legend

| Symbol | Meaning |
|---|---|
| 🟢 | **Production-connected** — Uses real trained models or live backend calls |
| 🟡 | **Prototype** — Interactive UI with sample/rule-based/demo data |
| 🔴 | **Stub** — UI skeleton only, no backend or logic connected |
| ⬜ | **Planned** — Not yet started |

---

## Module Matrix

| # | Module | Status | Backend | Real Data | Key Gaps |
|---|---|---|---|---|---|
| 1 | **Farmer Dashboard** | 🟡 | ❌ None | Sample district data hardcoded in `App.tsx` | Needs real sensor/farm API; weather from live BMD/OpenWeather |
| 2 | **Smart Farm Planner** | 🟡 | ❌ None | In-memory state, local crop catalog | No persistent storage; no field-level geo mapping |
| 3 | **AI Yield Prediction** | 🟢 | ✅ FastAPI | 5 trained XGBoost models + CRU TS baseline | Weak R² for Aman/Aus; no confidence intervals; no live weather |
| 4 | **Climate & Risk Intelligence** | 🟡 | ❌ None | Rule-based alerts, hardcoded thresholds | No real forecast API; no BMD/BAMIS integration |
| 5 | **Disease Scanner** | 🟡 | ❌ None | Sample presets, offline fallback | Gemini Vision API key blank; no custom leaf classifier trained |
| 6 | **Smart Irrigation** | 🟡 | ❌ None | Sample water usage data | No IoT sensor integration; no ET₀ calculation from live weather |
| 7 | **AgriBot** | 🟡 | ❌ None | Local RAG knowledge base (4 verified sources) | Gemini API not configured server-side; no conversation persistence |
| 8 | **Marketplace** | 🟡 | ❌ None | In-memory products/orders/cart | No payment gateway; no real auth; no persistent database |
| 9A | **Satellite NDVI** | 🟡 | ❌ None | Mock NDVI trend data | No Sentinel-2/Copernicus API; no real imagery processing |
| 9B | **Admin Panel** | 🟢 | ✅ FastAPI `/health` | ML API status is real | Missing user/product management backend; no audit logs |
| 10 | **Harvest Traceability** | 🟡 | ❌ None | In-memory batch/QR records | No blockchain/supply chain backend; no real QR verification |

---

## Module Details

### Module 3: AI Yield Prediction 🟢 (The Crown Jewel)

**What works:**
- Real XGBoost inference through FastAPI
- 5 crop-specific models with saved preprocessing schemas
- CRU TS historical baseline auto-loaded per district/crop
- Scenario editing (users modify climate variables)
- Model transparency: MAE, RMSE, R² displayed alongside prediction
- RF vs XGBoost comparison shown in response
- Reliability flag for weak models (Aus R² < 0)

**What doesn't:**
- No prediction confidence intervals
- No live weather integration (baseline is historical average)
- Extrapolation beyond 2023 is unvalidated
- Aman R² = 0.043 (near-zero predictive power)
- Aus R² = -0.42 (worse than mean baseline)

### Module 7: AgriBot 🟡

**What works:**
- Bilingual Bengali/English/Banglish interface
- Local knowledge base from 4 verified agricultural sources (BRRI, BAMIS, BARI, FAO)
- Transparent source attribution

**What doesn't:**
- Gemini API key is blank in frontend code
- No server-side API proxy for Gemini
- No conversation history persistence

### Module 8: Marketplace 🟡

**What works:**
- Full buyer/seller UI flow
- Cart + order management in React state
- Role switching (Farmer sells, Consumer buys)

**What doesn't:**
- All data lives in React state (lost on refresh)
- No payment gateway (bKash, Nagad, SSLCommerz)
- No real authentication
- No database

---

## Priority Recommendation

```
Immediate    → Fix Yield Prediction weaknesses (Aus/Aman models)
Short-term   → Connect AgriBot to server-side Gemini with API proxy
              → Add persistent database (Firestore or PostgreSQL)
Mid-term     → Integrate live weather API for Climate module
              → Build Disease Scanner classifier
Long-term    → Satellite imagery pipeline
              → Marketplace payment integration
              → IoT sensor framework for irrigation
```

---

*Last updated: 2026-11-20*
