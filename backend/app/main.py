from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_application_settings
from app.database import connect_to_mongo_database, close_mongo_database_connection
from app.routers import attendance, auth, employees


settings = get_application_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle manager."""
    await connect_to_mongo_database()
    await auth.initialize_admin_account()
    yield
    await close_mongo_database_connection()


app = FastAPI(
    title="HRMS Lite",
    description="HR Management System API",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def handle_exception(request: Request, exc: Exception):
    """Catch-all handler for unexpected exceptions."""
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong", "success": False},
    )


app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(auth.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {"app": "HRMS Lite", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
