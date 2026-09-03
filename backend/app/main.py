from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config.settings import settings
from app.api.v1.router import api_router
from app.services import landsat_service

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info("Starting up FastAPI application...")
    logger.info("Warming the Landsat surface temperature snapshot for Thane...")
    landsat_service.prefetch()
    landsat_service.prefetch_history()

    yield
    
    # Shutdown logic
    logger.info("Shutting down FastAPI application...")

def create_app() -> FastAPI:
    """
    Application factory to create and configure the FastAPI application.
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan
    )

    # Set up CORS middleware
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Include routers
    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get("/health", tags=["Health"])
    async def health_check():
        """
        Health check endpoint to ensure the server is running.
        """
        return {"status": "healthy", "service": settings.PROJECT_NAME}

    @app.get("/", include_in_schema=False)
    async def root():
        """
        Root endpoint redirecting or greeting.
        """
        return {"message": f"Welcome to {settings.PROJECT_NAME}. Go to /docs for API documentation."}

    return app

app = create_app()
