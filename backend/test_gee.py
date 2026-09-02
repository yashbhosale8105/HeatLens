import logging
from app.core.gee_config import initialize_earth_engine

# Setup basic logging to see the output in the console
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    logger.info("=== Testing Google Earth Engine Authentication ===")
    
    # Call the reusable initialization function
    initialize_earth_engine()
    
    logger.info("=== Test Complete ===")
    logger.info("If you were asked to authenticate, credentials are now saved locally.")
    logger.info("Future runs will use the saved credentials automatically.")

if __name__ == "__main__":
    main()
