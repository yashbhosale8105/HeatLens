from fastapi import APIRouter
from app.api.v1 import earth_engine, weather

api_router = APIRouter()

api_router.include_router(earth_engine.router, prefix="/earth-engine", tags=["Earth Engine LST"])
api_router.include_router(weather.router, prefix="/weather", tags=["Weather & Risk Index"])
