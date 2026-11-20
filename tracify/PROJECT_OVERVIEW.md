# 🌾 AgriShield AI — Project Overview

## Vision

**AgriShield AI** is a climate-smart agriculture decision-support platform built for **Bangladesh**. It integrates machine learning crop yield prediction, climate-risk intelligence, disease scanning, farm planning, smart irrigation, traceability, and an agricultural marketplace into a unified interface designed for farmers, consumers, and administrators.

---

## Target Users

| Role | Primary Use Cases |
|---|---|
| **Farmer** | Yield prediction, farm planning, irrigation guidance, disease scanning, marketplace selling, harvest traceability |
| **Consumer** | Browse/buy agricultural products, trace harvest origins, place orders |
| **Admin** | System health monitoring, product management, order oversight, API status checks |

---

## Tech Stack

### Frontend
| Component | Technology | Version |
|---|---|---|
| Framework | React | 18.3.x |
| Build Tool | Vite | 5.4.x |
| Language | TypeScript (TSX) | ES2022 |
| Styling | Tailwind CSS | 3.4.x |
| Charts | Recharts | 2.15.x |
| Icons | Lucide React | 0.468.x |
| Auth/DB (optional) | Firebase | 11.10.x |
| CSS Processing | PostCSS + Autoprefixer | — |

### Backend
| Component | Technology | Version |
|---|---|---|
| Framework | FastAPI | 0.128.2 |
| Server | Uvicorn | 0.48.0 |
| ML Engine | XGBoost (native JSON) | ≥2.1 |
| Data Processing | Pandas 2.2.3, NumPy ≥1.26, SciPy ≥1.11 | — |
| Validation | Pydantic | 2.13.5 |
| Language | Python | 3.11 / 3.12 |

### Infrastructure
| Component | Technology |
|---|---|
| Containerization | Docker + Docker Compose |
| API Documentation | FastAPI auto-generated Swagger/OpenAPI at `/docs` |

---

## Scope Summary

| Capability | Status |
|---|---|
| **Crop Yield Prediction** | ✅ Connected — 5 trained XGBoost models served via FastAPI |
| **Climate & Risk Intelligence** | ⚠️ Prototype — Rule-based logic, sample data |
| **Disease Scanner** | ⚠️ Prototype — Sample presets, offline fallback, no live classifier |
| **Farm Planner** | ⚠️ Prototype — Interactive UI, demo records |
| **Smart Irrigation** | ⚠️ Prototype — Sample data, no real sensor feeds |
| **AgriBot Assistant** | ⚠️ Prototype — Local RAG fallback, Gemini API not configured |
| **Marketplace** | ⚠️ Prototype — UI complete, no payment gateway or real auth |
| **Harvest Traceability** | ⚠️ Prototype — QR/batch UI, demo records |
| **Satellite NDVI** | ⚠️ Prototype — Mock data, no real Sentinel-2 integration |
| **Admin Panel** | ✅ Connected — ML API health check is live |

---

## Key Numbers

- **5** crop-specific XGBoost models (Aman, Aus, Boro, Jute, Potato)
- **64** Bangladesh districts covered
- **12,800** climate records (CRU TS crop-season dataset)
- **10** functional modules in the UI
- **3** user roles (Farmer, Consumer, Admin)
- **~3,100 lines** in a single `App.tsx` monolith (the main refactoring target)
- **4** backend API tests passing
- **Training period:** 1984–2015 | **Test period:** 2016–2023

---

## Project Structure

```
AgriShield-AI2005/
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # 3,100-line monolith (all 10 modules)
│   │   ├── main.tsx             # Entry point
│   │   └── index.css            # Tailwind directives
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
├── backend/
│   ├── main.py                  # FastAPI server (214 lines)
│   ├── models/                  # 5 XGBoost JSON + 5 preprocessor JSONs
│   ├── data/                    # CRU TS dataset + benchmarks
│   ├── test_api.py              # 4 pytest tests
│   ├── requirements.txt
│   └── Dockerfile
├── docs/                        # Architecture, validation, demo script
├── tracify/                     # 📍 You are here
├── docker-compose.yml
└── README.md
```

---

*Last updated: 2026-11-20*
