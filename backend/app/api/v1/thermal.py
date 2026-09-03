from typing import Any, Dict, List

from fastapi import APIRouter, Query, Response

from app.services import thermal_service

router = APIRouter()


@router.get("/point", response_model=Dict[str, Any])
async def read_point(
    lat: float = Query(..., ge=18.0, le=21.0, description="Latitude in the Thane region"),
    lon: float = Query(..., ge=71.5, le=74.0, description="Longitude in the Thane region"),
):
    """Surface temperature and greenery for one coordinate, from the latest Landsat scene."""
    return thermal_service.point_reading(lat, lon)


@router.get("/grid", response_model=List[Dict[str, Any]])
async def read_grid(count: int = Query(49, ge=9, le=121)):
    """A regular grid of readings across Thane, ranked hottest first."""
    return thermal_service.grid_readings(count)


@router.get("/source", response_model=Dict[str, Any])
async def read_source():
    """Which data source is live, and the scene behind it."""
    return thermal_service.source_status()


@router.get("/historical", response_model=Dict[str, Any])
async def read_historical():
    """Year-by-year city surface temperature from pre-monsoon Landsat scenes."""
    return thermal_service.historical_trends()


@router.get("/export")
async def export_grid(
    format: str = Query("geojson", pattern="^(geojson|csv)$"),
    count: int = Query(49, ge=9, le=121),
):
    """Export the grid readings as GeoJSON or CSV."""
    if format == "csv":
        return Response(
            content=thermal_service.grid_csv(count),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=thane_heat_grid.csv"},
        )
    return thermal_service.grid_geojson(count)
