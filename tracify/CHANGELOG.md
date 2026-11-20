# 📋 Changelog

All notable changes to AgriShield AI are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.0.0] — 2026-11-20

### Added
- **FastAPI backend** with 4 API endpoints for yield prediction inference
- **5 XGBoost crop-specific models** (Aman, Aus, Boro, Jute, Potato) with native JSON export
- **5 preprocessor schemas** preserving fitted training encoder state
- **CRU TS crop-season climate dataset** (12,800 records, 64 districts, 1984–2023)
- **React frontend** with 10 integrated modules:
  - Farmer Dashboard
  - Smart Farm Planner
  - AI Yield Prediction (connected to backend)
  - Climate & Risk Intelligence
  - AI Crop Disease Scanner
  - Smart Irrigation
  - AgriBot Assistant
  - Agricultural Marketplace
  - Harvest Traceability
  - Satellite NDVI Monitoring
  - Admin Panel (connected to backend health check)
- **Role-based UI** (Farmer, Consumer, Admin) — prototype level
- **Docker Compose** setup for containerized deployment
- **4 backend pytest tests** covering health, predictions, error handling, and model comparison
- **Model conversion validation** — all 2,560 holdout predictions match to < 9e-16 abs diff
- **Documentation:** Architecture, Model Validation, Demo Script, Test Report, Dataset README
- **Tracify folder** with comprehensive project intelligence documentation

### Known Limitations
- Aus rice model has negative R² (-0.42) on held-out test set
- Aman rice model has near-zero R² (0.04)
- Disease Scanner, AgriBot, Marketplace, Traceability, Irrigation, NDVI — all prototype/demo level
- No authentication, no persistent database, no CI/CD
- Frontend is a ~3,100-line monolith in a single App.tsx

---

## [Unreleased]

### Planned
- Frontend modularization (split App.tsx)
- Firebase Auth integration
- AgriBot backend with Gemini API proxy
- Live weather API integration
- CI/CD pipeline with GitHub Actions

---

## Template for Future Entries

```markdown
## [X.Y.Z] — YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing functionality

### Deprecated
- Features that will be removed

### Removed
- Features that were removed

### Fixed
- Bug fixes

### Security
- Security-related changes
```

---

*Last updated: 2026-11-20*
