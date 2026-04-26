# CASCADE Phase 1 - Implementation Plan

## Goal
Build a complete vertical slice of the **Cognitive Anticipatory Supply Chain Decision Engine**: data ingestion → ML prediction → decision recommendations → interactive dashboard.

## Environment Assessment

| Tool | Version | Status |
|------|---------|--------|
| Python | 3.12.0 | ✅ |
| Node.js | 22.13.0 | ✅ |
| Docker | 28.3.2 | ✅ |
| PostgreSQL CLI | N/A | ❌ Not installed locally |

## User Review Required

> [!IMPORTANT]
> **Database Choice: SQLite vs PostgreSQL**
> PostgreSQL is not installed locally. Two options:
> 1. **SQLite** (recommended for Phase 1) — Zero setup, same SQLAlchemy ORM code, trivially portable to PostgreSQL later. Schema stays identical.
> 2. **PostgreSQL via Docker** — More production-like but adds Docker dependency and setup complexity.
>
> **Recommendation:** Use SQLite for rapid development. The SQLAlchemy ORM layer makes switching to PostgreSQL a 1-line config change.

> [!IMPORTANT]
> **Frontend Framework: Vite vs CRA**
> The spec mentions `create-react-app` but CRA is deprecated. I'll use **Vite** with React + TypeScript + Tailwind CSS v4 instead (modern, fast, actively maintained).

> [!WARNING]
> **Weather API Key**
> The spec references OpenWeatherMap. For Phase 1 demo, the synthetic data generator will produce all weather data. Real API integration can be added later without architectural changes. No API key needed for the demo.

---

## Proposed Changes

### Component 1: Project Scaffolding

#### [NEW] `cascade-phase1/` project root
- Create full directory structure as specified
- Backend Python package structure
- Frontend Vite + React + TypeScript project

---

### Component 2: Backend — Database & Models

#### [NEW] `backend/app/database.py`
- SQLAlchemy engine with SQLite (swappable to PostgreSQL)
- Session management with `get_db()` dependency

#### [NEW] `backend/app/models.py`
- 5 SQLAlchemy models: `Shipment`, `WeatherData`, `DisruptionPrediction`, `Recommendation`, `ActualOutcome`
- Full relationships and indexes

#### [NEW] `backend/app/schemas.py`
- Pydantic v2 schemas for all API request/response types

#### [NEW] `backend/app/crud.py`
- Database CRUD operations abstracted from API routes

---

### Component 3: Backend — ML Pipeline

#### [NEW] `backend/data/synthetic_generator.py`
- Generate 500 shipments across 15 US cities
- Generate weather conditions along routes (5 waypoints each)
- Inject disruptions with weather-correlated probabilities

#### [NEW] `backend/ml/feature_engineering.py`
- 16-feature engineering pipeline
- Weather aggregations, route features, temporal features, carrier reliability

#### [NEW] `backend/ml/model_trainer.py`
- XGBoost classifier for disruption prediction (binary)
- XGBoost regressor for delay estimation
- Probability calibration with isotonic regression
- Model persistence with joblib

#### [NEW] `backend/ml/predictor.py`
- Load trained models and run inference
- Multi-horizon prediction simulation
- Risk categorization

#### [NEW] `backend/ml/decision_generator.py`
- Generate 3 ranked alternatives per high-risk shipment
- Multi-objective scoring (cost, time, emissions, risk)

---

### Component 4: Backend — FastAPI API

#### [NEW] `backend/app/main.py`
- FastAPI app with CORS middleware
- Health check, dashboard summary, shipment CRUD
- Prediction generation (single + batch)
- Synthetic data generation endpoint
- High-risk predictions endpoint
- Startup event: auto-generate data and train model if DB is empty

#### [NEW] `backend/app/api/shipments.py`
- Shipment list, detail, filtering endpoints

#### [NEW] `backend/app/api/predictions.py`
- Prediction generation and retrieval

#### [NEW] `backend/app/api/recommendations.py`
- Recommendation retrieval per prediction

#### [NEW] `backend/requirements.txt`
- All Python dependencies

---

### Component 5: Frontend — React Dashboard

#### [NEW] `frontend/` — Vite + React + TypeScript + Tailwind CSS
- Premium dark-theme dashboard with glassmorphism
- Rich animations and micro-interactions

#### [NEW] Key Components:
| Component | Purpose |
|-----------|---------|
| `Dashboard.tsx` | Main layout with metrics, alerts, map |
| `MetricsPanel.tsx` | 4 KPI cards with live data |
| `AlertCard.tsx` | High-risk shipment cards with risk badges |
| `ShipmentMap.tsx` | Interactive Leaflet map with route lines |
| `RecommendationCard.tsx` | 3 alternatives with cost/time/risk comparison |
| `ShipmentDetail.tsx` | Detailed view with predictions + recommendations |
| `RiskChart.tsx` | Recharts-based risk distribution visualization |

#### Design System:
- **Theme:** Dark mode with deep navy/slate backgrounds
- **Accent:** Vibrant cyan/blue primary, amber warnings, red alerts
- **Typography:** Inter font family
- **Effects:** Glassmorphism cards, gradient accents, smooth transitions
- **Layout:** Responsive grid, sidebar navigation

---

## Execution Strategy

### Phase A: Backend Foundation (Files + DB + Data)
1. Create project structure
2. Set up Python virtual environment and install deps
3. Implement database layer (SQLite + SQLAlchemy)
4. Implement synthetic data generator
5. Implement ML pipeline (feature engineering → training → prediction)

### Phase B: Backend API
6. Build FastAPI app with all endpoints
7. Add startup logic: auto-seed data + train model
8. Test endpoints

### Phase C: Frontend
9. Scaffold Vite + React + TypeScript + Tailwind
10. Build design system and layout
11. Implement all dashboard components
12. Connect to backend API
13. Polish UI with animations

### Phase D: Integration & Demo
14. End-to-end testing
15. Demo script validation

---

## Verification Plan

### Automated Tests
- `curl` / browser test all API endpoints
- Verify ML model AUC > 0.80 from training logs
- Frontend renders with no console errors

### Manual Verification
- Launch backend (`uvicorn`), verify at `http://localhost:8000/docs`
- Launch frontend (`npm run dev`), verify dashboard loads
- Click through demo flow: overview → high-risk alert → recommendations
- Screenshot the final dashboard

---

## Open Questions

> [!IMPORTANT]
> 1. **SQLite vs PostgreSQL** — Do you want me to proceed with SQLite for rapid development, or set up PostgreSQL via Docker?
> 2. **Tailwind CSS version** — The spec says Tailwind CSS. Should I use **Tailwind v4** (latest) or **v3** (more established)?
> 3. **Demo priority** — Should I prioritize getting the full stack working end-to-end first, or spend more time on visual polish?
