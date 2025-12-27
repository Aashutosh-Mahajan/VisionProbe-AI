gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
# Visual Product Intelligence Platform (VPIP)

Formal documentation for the Visual Product Intelligence Platform: a decision-intelligence system that transforms a single product image into a structured, explainable Product Intelligence Report with health, environmental, and ethical guidance.

---

## 1) Overview

- Purpose: Help users understand what a product is, how it is used, its risks, and ethical purchase guidance, using only an image input.
- Core capabilities: multi-agent analysis, confidence-aware identification, impact and risk assessment, recommendations, and buy guidance with safety gating.
- Tech stack: Django 5 + DRF, React 19 + Vite, Tailwind, OpenAI GPT (multi-agent pipeline).

---

## 2) System Architecture

```
User → React (Vite) → Django REST API → Orchestrator → AI Agents (OpenAI Chat Completion)
                                   ↓
                               Media storage (uploads)
```

Components
- Frontend: Vite + React, Tailwind styling, API client at frontend/src/api.js.
- Backend: Django + DRF, core app exposes /api/v1 endpoints.
- Orchestrator: pipelines the six agents, handles fail-fast on low confidence, captures errors.
- Agents: six GPT-backed agents with structured JSON prompts (see backend/core/agents.py).

---

## 3) Features

- Image upload with size/format validation (JPEG/PNG/WEBP, <5MB) and integrity check.
- Six-agent AI pipeline with structured JSON outputs: visual ID, knowledge, use case, impact, recommendations, buy guidance.
- Confidence-based abort to avoid cascading bad analysis.
- Safety gate: high-risk products disable purchase recommendations.
- REST API with throttling (anonymous: 100/hour) and CORS controls.
- Structured logging to console and logs/vpip.log.
- Health check endpoint for uptime probes.

---

## 4) Requirements

- Python 3.11+
- Node.js 18+
- OpenAI API key with access to the configured GPT model (default: gpt-5.1)

---

## 5) Local Setup

Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # on Windows
pip install -r requirements.txt
copy .env.example .env   # or cp on macOS/Linux
# Set OPENAI_API_KEY in .env
python manage.py migrate
python manage.py runserver
```

Frontend
```bash
cd frontend
npm install
copy .env.example .env.local   # optional, set VITE_API_URL
npm run dev
```

Access
- Frontend: http://localhost:5173
- Backend API root: http://localhost:8000/api/v1/
- Health check: http://localhost:8000/api/v1/health/

---

## 6) Environment Configuration

Backend (.env)
- OPENAI_API_KEY (required) — OpenAI key used by all agents.
- SECRET_KEY — Django secret (generate new for prod).
- DEBUG — True/False; set False for prod.
- DATABASE_URL — Postgres URL; defaults to SQLite when empty.
- GPT_MODEL_NAME — Default gpt-4o.
- ALLOWED_HOSTS — Comma-separated hostnames.
- CORS_ALLOWED_ORIGINS — Comma-separated frontend origins (used in production).

Frontend (.env.local)
- VITE_API_URL — Backend API base (default http://localhost:8000/api/v1).

---

## 7) Data Flow

1) Client uploads image to POST /api/v1/analyze/.
2) Backend validates file size/format, verifies image integrity, stores upload.
3) Orchestrator invokes agents sequentially:
   - VisualIdentificationAgent (fail-fast if confidence < 0.5)
   - KnowledgeEnrichmentAgent
   - UseCaseAgent
   - ImpactAnalysisAgent
   - RecommendationAgent
   - BuyLinkAgent (skipped or disabled on high risk)
4) Aggregated report is saved to UploadedImage.analysis_report and returned.

---

## 8) API Reference

POST /api/v1/analyze/
- Form-data: image (file)
- Responses:
  - 201 success: report payload with product_summary, knowledge, usage, impact, recommendations, buy_guidance, disclaimer.
  - 400 validation errors (missing image, size/format, invalid file).

GET /api/v1/health/
- Returns {"status":"ok","version":"1.0.0"}

---

## 9) Testing

```bash
cd backend
python manage.py test          # all tests
python manage.py test core -v2 # verbose
```

Key tests: upload success/error cases, low-confidence abort, high-risk buy-block.

---

## 10) Operations and Troubleshooting

Common issues
- Missing OPENAI_API_KEY: orchestrator will raise and analysis fails; set the key and restart.
- OpenAI 400 "max_tokens not supported": ensure backend uses max_completion_tokens (already updated).
- CORS/hosts: set ALLOWED_HOSTS and CORS_ALLOWED_ORIGINS in production.
- Large images: limit is 5MB; resize before upload.

Logs
- Console logging plus file output at logs/vpip.log (auto-created).

Performance
- Current pipeline is synchronous. For production, move analysis to async workers (Celery/RQ) and return job IDs.

---

## 11) Security and Compliance

- Image validation and integrity check (PIL verify).
- Rate limiting for anonymous traffic (100/hour).
- CORS configured; tighten origins in production.
- High-risk purchase gating; mandatory disclaimers in reports.
- HTTPS recommended in production with secure cookies and security headers (enabled when DEBUG=False).

---

## 12) Project Layout

```
backend/
  manage.py
  config/           # settings, urls, wsgi/asgi
  core/             # agents, orchestrator, views, models, tests
  media/uploads/    # user uploads (dev)
  logs/             # vpip.log
frontend/
  src/              # React app (UploadZone, ReportView, App)
docs/               # architecture, API contract, product spec
```

---

## 13) Roadmap (next steps)

- Async analysis jobs with status polling.
- Structured observability (metrics/traces) and cost tracking per request.
- Docker packaging and CI pipeline.
- Enhanced PII handling and content safety filters.

---

## 14) License

MIT License (see LICENSE).
