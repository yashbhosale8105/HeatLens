"""Surface heat readings for Thane.

Values come from the most recent usable Landsat scene. When no scene is
available the service still answers, but every reading is labelled as a
modelled estimate so nothing in the app claims to be satellite data when it
is not.
"""

import logging
import math
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.services import landsat_service

logger = logging.getLogger(__name__)

THANE_CENTER_LAT = 19.2183
THANE_CENTER_LON = 72.9781

# The Thane window the map and grid cover: min_lon, min_lat, max_lon, max_lat.
GRID_BOUNDS = landsat_service.THANE_BBOX

THANE_AREAS = [
    ("Thane Central", 19.2183, 72.9781),
    ("Thane Station", 19.1863, 72.9756),
    ("Naupada", 19.1978, 72.9726),
    ("Panch Pakhadi", 19.2048, 72.9668),
    ("Teen Hath Naka", 19.2065, 72.9739),
    ("Court Naka", 19.1942, 72.9748),
    ("Jambli Naka", 19.1948, 72.9704),
    ("Talao Pali", 19.1936, 72.9678),
    ("Kopri", 19.1865, 72.9782),
    ("Kalwa", 19.1948, 72.9986),
    ("Mumbra", 19.1762, 73.0264),
    ("Diva", 19.1881, 73.0427),
    ("Wagle Estate", 19.185, 72.952),
    ("Lokmanya Nagar", 19.1914, 72.9588),
    ("Vartak Nagar", 19.2096, 72.9612),
    ("Majiwada", 19.2268, 72.9844),
    ("Balkum", 19.2326, 72.9915),
    ("Kolshet", 19.2388, 72.9802),
    ("Manpada", 19.2334, 72.9721),
    ("Kapurbawdi", 19.2241, 72.9736),
    ("Cadbury Junction", 19.2289, 72.9698),
    ("Ghodbunder Road", 19.245, 72.971),
    ("Kasarvadavali", 19.2672, 72.9674),
    ("Owale", 19.2586, 72.9728),
    ("Brahmand", 19.2518, 72.9645),
    ("Hiranandani Estate", 19.2614, 72.9796),
    ("Hiranandani Meadows", 19.2562, 72.9744),
    ("Anand Nagar", 19.2542, 72.9818),
    ("Kavesar", 19.2466, 72.9764),
    ("Waghbil", 19.2724, 72.9726),
    ("Yeoor Hills", 19.24, 72.94),
    ("Yeoor", 19.2436, 72.9368),
    ("Upvan Lake", 19.2318, 72.9514),
    ("Louis Wadi", 19.2112, 72.9695),
    ("Thane Creek", 19.2054, 72.9981),
    ("Kharegaon", 19.2148, 73.0126),
]

MODEL_NOTE = (
    "Modelled estimate: no usable Landsat scene was available, so this value is "
    "interpolated from Thane's urban heat island shape and is not a measurement."
)


def nearest_area_name(lat: float, lon: float) -> str:
    best_name = "Thane Central"
    best_dist = float("inf")
    for name, area_lat, area_lon in THANE_AREAS:
        dist = (lat - area_lat) ** 2 + (lon - area_lon) ** 2
        if dist < best_dist:
            best_dist = dist
            best_name = name
    return best_name


def describe_vegetation(ndvi: Optional[float]) -> str:
    if ndvi is None:
        return "Not available"
    if ndvi < 0.0:
        return "Water or wet surface"
    if ndvi < 0.15:
        return "Built-up, little vegetation"
    if ndvi < 0.3:
        return "Sparse vegetation"
    if ndvi < 0.5:
        return "Moderate greenery"
    return "Dense vegetation"


def _model_reading(lat: float, lon: float) -> Dict[str, float]:
    """Distance-decay stand-in used only when no scene is available."""
    dist = math.sqrt((lat - THANE_CENTER_LAT) ** 2 + (lon - THANE_CENTER_LON) ** 2)
    base = 38.5 - dist * 45.0
    seed = int((lat * 1000 + lon * 1000) * 100) % 100
    lst = max(26.0, min(48.5, base + (seed / 100.0 - 0.5) * 4.0))
    return {"lst_celsius": round(lst, 2)}


def point_reading(lat: float, lon: float) -> Dict[str, Any]:
    """Surface temperature and greenery for one coordinate."""
    measured = landsat_service.sample(lat, lon)

    if measured is not None:
        scene = measured["scene"]
        lst = measured["lst_celsius"]
        ndvi = measured["ndvi_index"]
        return {
            "latitude": round(lat, 5),
            "longitude": round(lon, 5),
            "lst_celsius": lst,
            "lst_fahrenheit": round(lst * 9 / 5 + 32, 2),
            "ndvi_index": ndvi,
            "vegetation_density": describe_vegetation(ndvi),
            "data_source": "landsat",
            "satellite": f"{scene['platform']} - {scene['collection']}",
            "band": scene["bands"],
            "acquisition_date": scene["acquired"],
            "cloud_cover": scene["cloud_cover"],
            "scene_id": scene["scene_id"],
            "sample_radius_m": measured["sample_radius_m"],
            "quality": (
                f"Nearest clear pixels within {measured['sample_radius_m']} m"
                if measured["gap_filled"]
                else "Clear pixel"
            ),
            "note": None,
        }

    modelled = _model_reading(lat, lon)
    lst = modelled["lst_celsius"]
    return {
        "latitude": round(lat, 5),
        "longitude": round(lon, 5),
        "lst_celsius": lst,
        "lst_fahrenheit": round(lst * 9 / 5 + 32, 2),
        "ndvi_index": None,
        "vegetation_density": "Not available",
        "data_source": "model",
        "satellite": None,
        "band": None,
        "acquisition_date": None,
        "cloud_cover": None,
        "scene_id": None,
        "sample_radius_m": None,
        "quality": "Modelled estimate",
        "note": MODEL_NOTE,
    }


def grid_readings(points_count: int = 49) -> List[Dict[str, Any]]:
    """A regular grid of readings across Thane, ranked hottest first."""
    min_lon, min_lat, max_lon, max_lat = GRID_BOUNDS
    rows = max(2, int(math.sqrt(points_count)))
    cols = rows
    lat_step = (max_lat - min_lat) / rows
    lon_step = (max_lon - min_lon) / cols

    grid: List[Dict[str, Any]] = []
    counter = 1
    for i in range(rows):
        for j in range(cols):
            lat = min_lat + (i + 0.5) * lat_step
            lon = min_lon + (j + 0.5) * lon_step
            reading = point_reading(lat, lon)
            grid.append(
                {
                    "id": f"GRID-{counter:03d}",
                    "neighborhood": nearest_area_name(lat, lon),
                    "latitude": round(lat, 5),
                    "longitude": round(lon, 5),
                    "lst_celsius": reading["lst_celsius"],
                    "ndvi_index": reading["ndvi_index"],
                    "data_source": reading["data_source"],
                    "heat_rank": 0,
                }
            )
            counter += 1

    grid.sort(key=lambda item: item["lst_celsius"], reverse=True)
    for rank, item in enumerate(grid, 1):
        item["heat_rank"] = rank
    return grid


def source_status() -> Dict[str, Any]:
    state = landsat_service.status()
    stats = landsat_service.city_statistics()
    return {
        "source": state["source"],
        "status": state["status"],
        "detail": state.get("detail") or "",
        "scene": state["scene"],
        "city_stats": stats,
        "model_note": None if state["source"] == "landsat" else MODEL_NOTE,
        "checked_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }


def historical_trends() -> Dict[str, Any]:
    """Per-year city surface temperature from the clearest pre-monsoon scene."""
    rows = landsat_service.yearly_peaks()
    if not rows:
        return {
            "available": False,
            "source": "landsat",
            "note": "Building the yearly Landsat series. Reload in a minute.",
            "rows": [],
        }
    return {
        "available": True,
        "source": "landsat",
        "note": (
            "Each year uses the clearest Landsat scene from March to May, Thane's "
            "pre-monsoon peak. Values are city-wide surface temperature."
        ),
        "rows": rows,
    }


def grid_geojson(points_count: int = 49) -> Dict[str, Any]:
    grid = grid_readings(points_count)
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [item["longitude"], item["latitude"]],
                },
                "properties": {
                    "id": item["id"],
                    "neighborhood": item["neighborhood"],
                    "lst_celsius": item["lst_celsius"],
                    "ndvi_index": item["ndvi_index"],
                    "heat_rank": item["heat_rank"],
                    "data_source": item["data_source"],
                },
            }
            for item in grid
        ],
    }


def grid_csv(points_count: int = 49) -> str:
    grid = grid_readings(points_count)
    lines = ["rank,id,neighborhood,latitude,longitude,lst_celsius,ndvi_index,data_source"]
    for item in grid:
        ndvi = "" if item["ndvi_index"] is None else item["ndvi_index"]
        lines.append(
            f'{item["heat_rank"]},{item["id"]},"{item["neighborhood"]}",'
            f'{item["latitude"]},{item["longitude"]},{item["lst_celsius"]},{ndvi},{item["data_source"]}'
        )
    return "\n".join(lines)
