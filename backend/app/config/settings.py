from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "HeatLens 🌡️📡"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    # Google Earth Engine Configuration
    GEE_PROJECT_ID: str = "ee-heatlens"
    GEE_SERVICE_ACCOUNT: str = ""
    GEE_KEY_FILE: str = ""

    # Default Bounding Box for Thane City, Maharashtra, India
    THANE_BBOX: List[float] = [72.93, 19.15, 73.05, 19.32] # min_lon, min_lat, max_lon, max_lat
    
    model_config = SettingsConfigDict(case_sensitive=True, extra="allow")


settings = Settings()
