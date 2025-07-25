from fastapi import APIRouter
from app.schemas.auth_schema import LoginRequest
from app.services.auth.signin_service import login_user_service, reset_password_service
from app.utils.response import not_found_response, success_response
from app.utils.exceptions import UserNotFoundError

router = APIRouter(tags=["Auth"])


@router.post("/signin")
def login_user(login_data: LoginRequest):
    print("🔐 Processing login request...")
    """
    API to login a user with email and password.
    """
    result = login_user_service(login_data)

    if result.get("success") is False:
        print("❌ Login failed for", result.get("message"))
        return {
            "success": False,
            "message": "Invalid credentials",
        }
    return success_response(message="Login successful", data=result)


# ---------------------Reset Password---------------------
@router.post("/reset_password/{email}")
async def reset_password(email: str):
    """
    Sends a Firebase password reset email to the user.
    """
    result = await reset_password_service(email)
    if result["success"] is False:
        print("❌ Password reset failed for", result.get("message"))
        return {"success": False, "message": "Please Enter a Valid Email Address"}
    print("✅ Password reset email sent successfully")
    return {"success": True, "message": result["message"]}
