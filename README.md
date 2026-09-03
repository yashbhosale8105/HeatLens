# HeatLens

Heat watch for Thane City. The app shows live weather, a satellite heat map of the city, and a ranked sample table you can search or export.

## Where the data comes from

- **Air temperature, humidity, wind, UV** are live from [Open-Meteo](https://open-meteo.com). The "feels like" figure is the NOAA heat index.
- **Ground temperature and greenery** are measured from Landsat 8 and 9, USGS Collection 2 Level-2: the `ST_B10` thermal band for surface temperature and `SR_B4`/`SR_B5` for NDVI, at 30 m per pixel. Scenes are read from the [Microsoft Planetary Computer](https://planetarycomputer.microsoft.com) STAC catalog, which needs no account or API key.

The backend picks the most recent scene that fully covers Thane and is mostly cloud-free, masks cloudy pixels with the scene QA band, and caches that window in `backend/.cache/` for a day. Every reading in the UI names the satellite, the acquisition date and the cloud cover behind it.

Two consequences of using real satellite data are worth knowing. Surface temperature is the temperature of the ground itself, so tarmac can read far above the air temperature. And Landsat passes overhead roughly every eight days, with Thane's monsoon months heavily clouded, so the newest usable scene may be weeks old — the date shown is always when the measurement was taken. If no usable scene can be reached, the app says so on screen and labels its numbers as modelled estimates instead of presenting them as measurements.

## Stack

- Backend: FastAPI, Open-Meteo, Landsat Collection 2 via pystac-client and rasterio
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

The first start downloads a Landsat scene window for Thane, which takes about 20-30 seconds in the background. Until it lands, readings are labelled as modelled estimates; the pages switch over to measurements on their own.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API lives at [http://127.0.0.1:8000](http://127.0.0.1:8000), with docs at `/docs`.

## API

| Endpoint | What it returns |
| --- | --- |
| `GET /api/v1/weather/current` | Live weather and NOAA heat index |
| `GET /api/v1/thermal/point` | Surface temperature and NDVI for one coordinate |
| `GET /api/v1/thermal/grid` | Regular grid of readings across Thane, ranked |
| `GET /api/v1/thermal/source` | Which source is live, and the scene behind it |
| `GET /api/v1/thermal/historical` | City surface temperature per year, pre-monsoon scenes |
| `GET /api/v1/thermal/export` | The grid as GeoJSON or CSV |

## Docker

```bash
docker compose up --build
```

## Project layout

```
backend/app/api/       Routes for weather and thermal readings
backend/app/services/  Landsat scene access, heat readings, weather
backend/tests/         API and provenance tests
frontend/src/app/      Pages: Overview, Map, Data, About
frontend/src/components
frontend/src/lib       Types, API client, shared helpers
```
