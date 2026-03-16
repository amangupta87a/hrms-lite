from motor.motor_asyncio import AsyncIOMotorClient

from app.config import get_application_settings


settings = get_application_settings()


class MongoDatabaseClient:
    client: AsyncIOMotorClient | None = None


database_client = MongoDatabaseClient()


async def connect_to_mongo_database():
    """Open a connection to the configured MongoDB instance."""
    database_client.client = AsyncIOMotorClient(settings.MONGODB_URL)
    print(f"Connected to MongoDB at {settings.MONGODB_URL}")


async def close_mongo_database_connection():
    """Gracefully close the MongoDB client connection if it is open."""
    if database_client.client:
        database_client.client.close()
        print("MongoDB connection closed")


def get_application_database():
    """Return the active database handle for this application."""
    return database_client.client[settings.DATABASE_NAME]


def get_employee_collection():
    """Return the Mongo collection used for employee documents."""
    return get_application_database()["employees"]


def get_attendance_collection():
    """Return the Mongo collection used for attendance documents."""
    return get_application_database()["attendance"]


def get_admin_collection():
    """Return the Mongo collection used for the single admin record."""
    return get_application_database()["admin"]
