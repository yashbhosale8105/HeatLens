# HeatLens

Heat watch for Thane City. The app shows live weather, a neighbourhood heat map, and a ranked sample table you can search or export.

## Stack

- Backend: FastAPI, Open-Meteo, optional Google Earth Engine
- Frontend: Next.js, React Leaflet, Recharts

## Run locally

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API lives at [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Docker

```bash
docker compose up --build
```

## Project layout

```
backend/app/          API, settings, weather and surface-temp services
backend/tests/        API and heat-index tests
frontend/src/app/     Pages: Overview, Map, Data, About
frontend/src/components
frontend/src/lib      Types, API client, shared helpers
```
