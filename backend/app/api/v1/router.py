from fastapi import APIRouter
from app.api.v1 import thermal, weather

api_router = APIRouter()

api_router.include_router(thermal.router, prefix="/thermal", tags=["Landsat surface temperature"])
api_router.include_router(weather.router, prefix="/weather", tags=["Weather & Risk Index"])
