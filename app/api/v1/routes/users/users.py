# routes/users.py
from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from app.utils.exceptions import UserNotFoundError
from app.utils.logger import logger
from app.services.users.user_service import (
    create_user_service,
    delete_user_service,
    get_user_by_id_service,
    get_user_service,
    update_user_service,
)
from app.utils.response import success_response, created_response, not_found_response
from app.schemas.user_schema import CreateUserSchema

router = APIRouter(tags=["Users"])


# -------------------Add User-------------------
@router.post("/add_user")
async def create_user(user: CreateUserSchema, request: Request):
    """
    API to create a new user.
    """
    # current_user = request.state.current_user
    logger.info(f"🔒 Authenticated user: {user.email} is creating a user.")

    user_created = create_user_service(user)
    result = created_response(data=user_created, message="User created successfully")
    return result


# -------------------Get User-------------------
@router.get("/view_users")
async def view_users(role: Optional[str] = None):
    """
    API to list users by role (or all).
    """
    result = await get_user_service(role)
    return success_response(data=result, message="Users retrieved successfully")


# -------------------Get User based on ID-------------------
@router.get("/{user_id}")
async def get_user(user_id: str):
    """
    API to fetch a user by ID.
    """
    try:
        user = await get_user_by_id_service(user_id)
        response = success_response(data=user, message="User fetched successfully")
        return response
    except UserNotFoundError:
        response = not_found_response(message="User not found")
        return response


# -------------------Update User-------------------
@router.put("/{user_id}")
async def update_user(user_id: str, request: Request):
    """
    API to update a user by ID.
    """
    try:
        payload = await request.json()

        display_name = payload.get("display_name")
        user_role = payload.get("user_role")
        PIN = payload.get("PIN")

        # Optional: basic validation
        if not all([display_name, user_role, PIN]):
            raise HTTPException(status_code=400, detail="Missing fields in request.")

        update_message = await update_user_service(
            user_id, display_name, user_role, PIN
        )

        response = success_response(
            data=update_message,
            message=f"User {update_message['display_name']} updated successfully",
        )
        return response
    except UserNotFoundError:
        response = not_found_response(message=f"User {user_id} not found")
        return response


# -------------------Delete User-------------------
@router.delete("/{user_id}")
def delete_user(user_id: str):
    """
    API to delete a user by ID.
    """
    try:
        delete_message = delete_user_service(user_id)
        response = success_response(
            data=delete_message, message=f"User {user_id} deleted successfully"
        )
        return response
    except UserNotFoundError:
        response = not_found_response(message=f"User {user_id} not found")
        return response
