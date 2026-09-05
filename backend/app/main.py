import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.database.session import engine
from app.database.base import Base
from app import models
from app.core.logging_config import setup_logging

from app.api.v1.auth import router as auth_router
from app.api.v1.scans import router as scans_v1_router
from app.api.v1.ai import router as ai_router
from app.api import (
    users,
    products,
    compliance,
    inspections,
    complaints,
    reports,
    dashboard,
    locations,
)

setup_logging()
logger = logging.getLogger(__name__)

# Initialize Database tables safely
try:
    Base.metadata.create_all(bind=engine)
    logger.info("FastAPI database tables initialized")
except Exception as db_err:
    logger.warning("Database table creation skipped on import (DB offline or unreachable): %s", db_err)

# Ensure storage & uploads directories exist
os.makedirs("storage/scans", exist_ok=True)
os.makedirs("storage/processed", exist_ok=True)
os.makedirs("storage/ocr", exist_ok=True)
os.makedirs("backend/uploads", exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Mount Static Storage & Uploads
app.mount("/static", StaticFiles(directory="storage"), name="static")
app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(scans_v1_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")
app.include_router(compliance.router, prefix="/api/v1")
app.include_router(inspections.router, prefix="/api/v1")
app.include_router(complaints.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(locations.router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "status": "online",
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs": "/docs",
    }


@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    logger.info("Health check requested")
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("Database connection successful")
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as error:
        logger.error("Database connection failed: %s", error)
        return {
            "status": "unhealthy",
            "database": "disconnected"
        }
