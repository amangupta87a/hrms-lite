from fastapi import APIRouter, HTTPException

from app.database import get_admin_collection
from app.schemas import (
    LoginRequest,
    LoginResponse,
    ChangePasswordRequest,
    CredentialsResponse,
)
from app.auth_utils import (
    encrypt_text_with_xor_and_base64,
    decrypt_text_with_xor_and_base64,
)


router = APIRouter(prefix="/api/auth", tags=["Auth"])


DEFAULT_USER_ID = "admin"
DEFAULT_PASSWORD = "admin123"


async def initialize_admin_account():
    """Create the default admin account if it does not already exist."""
    admin_collection = get_admin_collection()
    existing_admin = await admin_collection.find_one({"_id": "admin_user"})

    if not existing_admin:
        await admin_collection.insert_one(
            {
                "_id": "admin_user",
                "user_id": DEFAULT_USER_ID,
                "password": encrypt_text_with_xor_and_base64(DEFAULT_PASSWORD),
            }
        )
        print("Default admin created")

    return existing_admin


async def fetch_admin_account():
    """Fetch the admin account document, creating a default one if necessary."""
    admin_collection = get_admin_collection()
    admin_document = await admin_collection.find_one({"_id": "admin_user"})

    if not admin_document:
        await initialize_admin_account()
        admin_document = await admin_collection.find_one({"_id": "admin_user"})

    return admin_document


@router.get("/credentials", response_model=CredentialsResponse)
async def get_current_credentials():
    """Return the current admin credentials with the password decrypted (demo only)."""
    admin_document = await fetch_admin_account()

    return {
        "user_id": admin_document["user_id"],
        "password": decrypt_text_with_xor_and_base64(admin_document["password"]),
    }


@router.post("/login", response_model=LoginResponse)
async def login_with_admin_credentials(request_body: LoginRequest):
    """Validate a login attempt against the stored admin credentials."""
    admin_document = await fetch_admin_account()

    stored_plain_password = decrypt_text_with_xor_and_base64(
        admin_document["password"]
    )

    if (
        request_body.user_id == admin_document["user_id"]
        and request_body.password == stored_plain_password
    ):
        return {"success": True, "message": "Login successful"}

    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/change-password", response_model=LoginResponse)
async def change_admin_password(request_body: ChangePasswordRequest):
    """Change the stored admin password after validating the current one."""
    admin_document = await fetch_admin_account()
    admin_collection = get_admin_collection()

    stored_plain_password = decrypt_text_with_xor_and_base64(
        admin_document["password"]
    )

    if request_body.old_password != stored_plain_password:
        raise HTTPException(
            status_code=400, detail="Current password is incorrect"
        )

    if len(request_body.new_password) < 4:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 4 characters",
        )

    await admin_collection.update_one(
        {"_id": "admin_user"},
        {
            "$set": {
                "password": encrypt_text_with_xor_and_base64(
                    request_body.new_password
                )
            }
        },
    )

    return {"success": True, "message": "Password changed successfully"}


@router.post("/reset")
async def reset_admin_credentials_to_default():
    """Reset the admin credentials back to their original demo values."""
    admin_collection = get_admin_collection()

    await admin_collection.update_one(
        {"_id": "admin_user"},
        {
            "$set": {
                "user_id": DEFAULT_USER_ID,
                "password": encrypt_text_with_xor_and_base64(DEFAULT_PASSWORD),
            }
        },
        upsert=True,
    )

    return {"success": True, "message": "Credentials reset to default"}
