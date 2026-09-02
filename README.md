# HeatLens 🌡️📡

**HeatLens** is a satellite-powered Land Surface Temperature (LST) monitoring, heat risk scoring, and micro-grid heat analytics platform for Thane City, Maharashtra, India.

Powered by **Google Earth Engine (Landsat 8 Collection 2 Level 2 imagery)**, **FastAPI**, **Next.js**, **React-Leaflet**, and **Open-Meteo API**.

---

## 🌟 Key Features

- **Satellite LST Heat Raster Overlay**: Computes radiometric surface skin temperature in Celsius using Landsat 8 `ST_B10` with Collection 2 scale factors (`0.00341802 * ST + 149.0 - 273.15`).
- **QA_PIXEL & QA_RADSAT Masking**: Filters out clouds, cloud shadows, cirrus, fill, water bodies, and radiometric band saturation for clean thermal data.
- **Granular 500m Grid Ranking**: Covers Thane City with regular sample points to rank micro-locations from hottest to coolest.
- **Click-to-Query Temperature**: Click anywhere on the map to query exact point surface temperature with a 100m buffer reduction in sub-2 seconds.
- **Real-Time Weather & NOAA Heat Index**: Integrates Open-Meteo API to compute human-perceived heat index ($HI$) and classify heat risk categories (Normal, Caution, Extreme Caution, Danger, Extreme Danger).
- **Auto-Refreshing Satellite Cache**: Automatically checks Earth Engine every 3 hours for new imagery without requiring server restarts.

---

## 🚀 Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Geospatial Engine**: Google Earth Engine API (`earthengine-api`)
- **Weather Integration**: Open-Meteo API
- **Caching**: In-Memory TTL & Image Hash Cache

### Frontend
- **Framework**: Next.js 16 (React 19, TypeScript)
- **Mapping**: Leaflet / React-Leaflet
- **Styling**: Tailwind CSS

---

## 🛠️ Quick Start Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Earth Engine Service Account / Persistent OAuth Credentials

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend server runs at `http://127.0.0.1:8000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend web application runs at `http://localhost:3000`.

---

## 📜 License
MIT License
