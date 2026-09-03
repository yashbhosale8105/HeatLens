from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "HeatLens"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    # Thane City window shared by the map, the grid and the Landsat reads.
    # min_lon, min_lat, max_lon, max_lat
    THANE_BBOX: List[float] = [72.925, 19.155, 73.045, 19.29]
    
    model_config = SettingsConfigDict(case_sensitive=True, extra="allow")


settings = Settings()
