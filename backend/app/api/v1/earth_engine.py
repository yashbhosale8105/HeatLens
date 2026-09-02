from fastapi import APIRouter, Query, Response
from typing import Dict, Any, List
from app.services.earth_engine_service import EarthEngineService

router = APIRouter()

@router.get("/query-point", response_model=Dict[str, Any])
async def query_point_temperature(
    lat: float = Query(..., ge=18.0, le=21.0, description="Latitude in Thane region"),
    lon: float = Query(..., ge=71.5, le=74.0, description="Longitude in Thane region")
):
    """
    Query satellite Land Surface Temperature (LST) for a specific click coordinate with sub-2s latency.
    """
    return EarthEngineService.compute_lst_point(lat, lon)

@router.get("/grid-ranks", response_model=List[Dict[str, Any]])
async def get_grid_ranks(count: int = Query(25, ge=9, le=100)):
    """
    Returns regular 500m grid sample points ranked by surface thermal index across Thane City.
    """
    return EarthEngineService.get_thane_grid_ranks(count)

@router.get("/overlay-metadata", response_model=Dict[str, Any])
async def get_overlay_metadata():
    """
    Returns Landsat 8 satellite LST raster color palette, temperature ranges, and layer bounds.
    """
    return EarthEngineService.get_raster_overlay_tile()

@router.get("/export")
async def export_grid_data(
    format: str = Query("geojson", pattern="^(geojson|csv)$"),
    count: int = Query(25, ge=9, le=100)
):

    """
    Export micro-grid surface temperature and NDVI rankings as GeoJSON or CSV format.
    """
    if format == "csv":
        csv_content = EarthEngineService.export_grid_csv(count)
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=thane_heat_grid.csv"}
        )
    else:
        return EarthEngineService.export_grid_geojson(count)

@router.get("/historical", response_model=List[Dict[str, Any]])
async def get_historical_trends():
    """
    Returns multi-year surface thermal trends (2021-2026) for Thane City micro-climate analysis.
    """
    return EarthEngineService.get_historical_trends()

