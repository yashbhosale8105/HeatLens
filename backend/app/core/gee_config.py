import ee
import logging
from app.config.settings import settings

logger = logging.getLogger(__name__)

def initialize_earth_engine():
    """
    Initializes Google Earth Engine API with high reliability.
    Falls back to high-fidelity mock / demo mode if Earth Engine credentials are not initialized locally.
    """
    try:
        if settings.GEE_SERVICE_ACCOUNT and settings.GEE_KEY_FILE:
            credentials = ee.ServiceAccountCredentials(settings.GEE_SERVICE_ACCOUNT, settings.GEE_KEY_FILE)
            ee.Initialize(credentials)
            logger.info("Successfully initialized Earth Engine with Service Account credentials.")
        else:
            try:
                ee.Initialize(project=settings.GEE_PROJECT_ID)
                logger.info(f"Successfully initialized Earth Engine with project {settings.GEE_PROJECT_ID}.")
            except Exception:
                ee.Initialize()
                logger.info("Successfully initialized Earth Engine with default credentials.")
    except Exception as e:
        logger.warning(f"Earth Engine initialization notice: {e}")
        logger.info("HeatLens operating with resilient synthetic geospatial estimation mode.")
