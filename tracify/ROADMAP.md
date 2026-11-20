# 🗺️ Development Roadmap

## Phase 1: Foundation Hardening (Weeks 1–4)
> **Goal:** Make the existing codebase maintainable, testable, and deployable.

### Frontend Restructuring
- [ ] Split `App.tsx` monolith into 10+ module files
- [ ] Add React Router v6 for navigation
- [ ] Introduce Zustand for global state management
- [ ] Extract constants, types, and utilities into separate files
- [ ] Add error boundaries per module
- [ ] Set up Vitest + React Testing Library
- [ ] Add ESLint + Prettier with pre-commit hooks

### Backend Hardening
- [ ] Add structured logging (JSON format)
- [ ] Add request validation error messages in Bengali
- [ ] Expand test suite to 20+ tests (edge cases, error paths)
- [ ] Add health check for data freshness
- [ ] Document API with OpenAPI examples

### DevOps
- [ ] Set up GitHub Actions CI pipeline (lint → test → build)
- [ ] Add Docker health checks and resource limits
- [ ] Create staging environment configuration
- [ ] Set up `.env` management with dotenv-vault or similar

---

## Phase 2: Core Integrations (Weeks 5–10)
> **Goal:** Connect the most valuable prototype modules to real backends.

### Authentication & Database
- [ ] Implement Firebase Auth (Google, phone OTP for farmers)
- [ ] Set up Firestore for farm, order, and user data persistence
- [ ] Add FastAPI JWT middleware
- [ ] Implement role-based access control (Farmer/Consumer/Admin)

### AgriBot Backend
- [ ] Create `/api/chat` endpoint as Gemini API proxy
- [ ] Implement RAG pipeline with agricultural knowledge base
- [ ] Add conversation history storage
- [ ] Rate limit and content filter for the chat API
- [ ] Bengali language support via Gemini's multilingual capability

### Live Weather Integration
- [ ] Integrate OpenWeather or BMD API for real-time forecasts
- [ ] Replace hardcoded district weather with live data
- [ ] Add weather alerts pipeline for Climate & Risk module
- [ ] Create weather data caching layer (15-min TTL)

---

## Phase 3: ML Excellence (Weeks 11–16)
> **Goal:** Improve model quality and add new ML capabilities.

### Yield Model Improvement
- [ ] Investigate Aus rice structural break (R² = -0.42)
- [ ] Engineer lag features and trend variables for Aman
- [ ] Try LightGBM and CatBoost alternatives
- [ ] Add prediction intervals (quantile regression)
- [ ] Set up MLflow for experiment tracking
- [ ] Create automated retraining pipeline

### Disease Scanner ML
- [ ] Train custom leaf disease classifier (rice blast, blight, etc.)
- [ ] Collect and label Bangladesh-specific crop disease images
- [ ] Deploy classification model to backend
- [ ] Add Gemini Vision as secondary analysis (server-side only)

### Satellite Integration
- [ ] Register for Copernicus Sentinel-2 API access
- [ ] Build NDVI computation pipeline (GeoTIFF → district averages)
- [ ] Create weekly NDVI update scheduled job
- [ ] Connect to Satellite NDVI module UI

---

## Phase 4: Marketplace & Traceability (Weeks 17–22)
> **Goal:** Enable real transactions and supply chain tracking.

### Marketplace Backend
- [ ] Create product listing CRUD API
- [ ] Integrate bKash/Nagad payment gateway (sandbox first)
- [ ] Add order management with status tracking
- [ ] Implement search, filtering, and recommendation engine
- [ ] Add seller verification workflow

### Harvest Traceability
- [ ] Design supply chain data model (farm → processing → transport → retail)
- [ ] Generate verifiable QR codes linked to batch records
- [ ] Create consumer-facing trace verification page
- [ ] Evaluate blockchain vs centralized audit log
- [ ] Add batch certificate generation (PDF export)

---

## Phase 5: IoT & Advanced Features (Weeks 23–30)
> **Goal:** Connect physical sensors and add advanced analytics.

### Smart Irrigation IoT
- [ ] Design IoT gateway protocol (MQTT/CoAP)
- [ ] Support soil moisture, temperature, humidity sensors
- [ ] Build ET₀ calculation from weather + sensor data
- [ ] Implement automated irrigation scheduling recommendations
- [ ] Create sensor management dashboard

### Farm Planner Enhancement
- [ ] Add field-level GPS mapping (Leaflet/Mapbox)
- [ ] Create crop rotation recommendation engine
- [ ] Add input cost tracking and profitability analysis
- [ ] Implement calendar-based task reminders (SMS/push)

### PWA & Offline
- [ ] Add service worker for offline access
- [ ] Implement offline data sync with conflict resolution
- [ ] Create lightweight mobile-first layout
- [ ] Add push notifications for weather alerts

---

## Phase 6: Scale & Launch (Weeks 31–36)
> **Goal:** Production deployment and growth.

### Production Infrastructure
- [ ] Deploy to GCP/AWS with managed Kubernetes or Cloud Run
- [ ] Set up CDN for frontend assets
- [ ] Implement database backups and disaster recovery
- [ ] Add APM monitoring (Datadog/New Relic)
- [ ] Security audit and penetration testing
- [ ] HTTPS with managed certificates

### Launch Preparation
- [ ] User acceptance testing with 50+ farmers in 3 districts
- [ ] Bengali localization audit
- [ ] Create user documentation and video tutorials
- [ ] Partner with DAE (Department of Agricultural Extension) for pilot
- [ ] Prepare pitch for agricultural ministry endorsement

---

## Success Metrics

| Metric | Target by v1.0 |
|---|---|
| Registered farmers | 500+ in pilot districts |
| Yield predictions served | 10,000+/month |
| AgriBot conversations | 5,000+/month |
| Marketplace transactions | 100+/month |
| Model R² (Boro) | > 0.50 (up from 0.43) |
| App uptime | 99.5% |
| Average response time | < 500ms |

---

*Last updated: 2026-11-20*
