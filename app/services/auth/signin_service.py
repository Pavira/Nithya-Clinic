# app/services/auth_service.py

from fastapi import HTTPException
import httpx
from app.schemas.auth_schema import LoginRequest
from app.utils.exceptions import InvalidLoginCredentials, UserNotFoundError
from app.utils.logger import logger
import os
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv
from app.db.firebase_client import db

load_dotenv()
FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY")


def login_user_service(login_data: LoginRequest) -> dict:
    print("🔐 Logging in user...")
    print("Firebase Key:---", FIREBASE_API_KEY)
    try:
        payload = {
            "email": login_data.email,
            "password": login_data.password,
            "returnSecureToken": True,
        }

        logger.info(f"🔐 Attempting login for {login_data.email}")

        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"
        response = requests.post(url, json=payload, timeout=30)
        response_data = response.json()

        if response.status_code != 200:
            print("❌ Login failed for", response.status_code, response_data)
            error_msg = response_data.get("error", {}).get(
                "message", "Invalid credentials"
            )
            logger.warning(f"⚠️ Login failed for {login_data.email}: {error_msg}")
            return {"success": False, "message": error_msg}

        uid = response_data["localId"]
        email = response_data["email"]

        # Ensure Firestore user exists — or create if not
        user_ref = db.collection("users").document(uid)
        user_snapshot = user_ref.get()

        if not user_snapshot.exists:
            logger.info(f"🆕 Creating Firestore user doc for UID: {uid}")
            user_ref.set(
                {
                    "email": email,
                    "display_name": "New User",  # Replace with dynamic if needed
                    "created_time": datetime.now(timezone.utc),
                    "last_login": datetime.now(timezone.utc),
                }
            )
            display_name = "New User"
            user_role = "Unknown Role"
        else:
            user_data = user_snapshot.to_dict()
            display_name = user_data.get("display_name", "Unknown User")
            user_role = user_data.get("user_role", "Unknown Role")
            user_ref.update({"last_login": datetime.now(timezone.utc)})

        logger.info(f"✅ Login successful for {email}")
        logger.info(f"✅ User role-----: {user_role}")

        return {
            "success": True,
            "email": email,
            "user_id": uid,
            "id_token": response_data["idToken"],
            "refresh_token": response_data["refreshToken"],
            "expires_in": response_data["expiresIn"],
            "logged_in_at": datetime.now().isoformat(),
            "display_name": display_name,
            "user_role": user_role,
            "redirect_url": "/admin/pages/dashboard/dashboard.html",
        }
    except Exception as e:
        logger.error(f"❌ Exception during login for {login_data.email}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def reset_password_service(email: str):
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={FIREBASE_API_KEY}"
    payload = {"requestType": "PASSWORD_RESET", "email": email}

    try:
        # Check User email
        user_ref = db.collection("users").where("email", "==", email)
        user_snapshot = user_ref.get()

        if len(user_snapshot) == 0:
            print("❌ User not found")
            return {"success": False, "message": "User not found"}
        else:
            async with httpx.AsyncClient() as client:
                res = await client.post(url, json=payload)

            if res.status_code == 200:
                return {"success": True, "message": "Password reset email sent"}
            else:
                error_detail = (
                    res.json().get("error", {}).get("message", "Unknown error")
                )
                raise HTTPException(status_code=res.status_code, detail=error_detail)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
