# services/user_service.py
from fastapi import HTTPException
from app.db.firebase_client import db, initialize_firebase
from firebase_admin import auth
from app.models.user_model import CreateUserModel
from app.utils.logger import logger
from app.utils.exceptions import UserNotFoundError
from datetime import datetime, timezone

from app.utils.response import (
    not_found_response,
    not_implemented_response,
)

# ------------ Firebase Collection name----------------
USERS_COLLECTION = "users"


# CREATE
def create_user_service(user_data):
    global db
    try:
        # Step 1: Create user in Firebase Auth
        user_record = auth.create_user(
            email=user_data.email,
            password=user_data.password,
            display_name=user_data.display_name,
        )
        logger.info(
            f"🔒 User {user_data.email} created in Firebase Auth with UID: {user_record.uid}"
        )

        # Step 2: Build the user model in the required Firestore format
        user_model = CreateUserModel(
            **user_data.model_dump(),
            created_time=datetime.now(timezone.utc),
            uid=user_record.uid,
            last_login=None,  # Initialize last_login as None
        )

        doc_ref = db.collection(USERS_COLLECTION).document(user_record.uid)
        doc_ref.set(user_model.model_dump())
        logger.info(
            f"✅ Firestore User {user_model.display_name} created successfully."
        )
        return {**user_model.model_dump()}
    except Exception as e:
        logger.error(f"❌ Failed to create user: {str(e)}")
        raise not_implemented_response()


# READ
async def get_user_service(role: str = None):
    global db
    try:
        users_ref = db.collection("users")
        if role is not None:
            print(f"🔍 Filtering users by role: {role}")
            query = users_ref.where("user_role", "==", role)
        else:
            query = users_ref

        docs = query.get()
        users = [doc.to_dict() | {"id": doc.id} for doc in docs]
        return {"users": users}
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise not_found_response()


# Get user by ID
async def get_user_by_id_service(user_id: str):
    global db
    try:
        doc_ref = db.collection(USERS_COLLECTION).document(user_id)
        doc = doc_ref.get()
        if not doc.exists:
            logger.error(f"❌ User not found with ID: {user_id}")
            raise UserNotFoundError()
        return doc.to_dict()
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise not_found_response()


# Update user
async def update_user_service(
    user_id: str, display_name: str, user_role: str, PIN: str
):
    global db
    doc_ref = db.collection("users").document(user_id)
    doc = doc_ref.get()
    if not doc.exists:
        logger.error(f"❌ User not found with ID: {user_id}")
        raise UserNotFoundError()
    update_data = {"display_name": display_name, "user_role": user_role, "PIN": PIN}
    doc_ref.update(update_data)

    return update_data


#  DELETE
def delete_user_service(user_id):
    global db
    doc_ref = db.collection("users").document(user_id)
    if not doc_ref.get().exists:
        logger.error(f"❌ Cannot delete non-existing user ID {user_id}")
        raise UserNotFoundError()
    doc_ref.delete()
    logger.info(f"✅ User {user_id} deleted.")
    return {"message": "User deleted successfully"}
