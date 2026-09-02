from fastapi import APIRouter, Query
from typing import Dict, Any
from app.services.weather_service import WeatherService

router = APIRouter()

@router.get("/current", response_model=Dict[str, Any])
async def get_current_weather(
    lat: float = Query(19.2183, description="Latitude"),
    lon: float = Query(72.9781, description="Longitude")
):
    """
    Returns ambient temperature, relative humidity, wind speed, UV index, NOAA heat index, and heat risk classification.
    """
    return WeatherService.get_current_weather(lat, lon)
