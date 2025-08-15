from app.api.v1.routes.drug_names import drug_names
from app.api.v1.routes.drug_category import drug_category
from app.api.v1.routes.dashboard import dashboard
from app.api.v1.routes.appointments import prescription_pdf
from app.api.v1.routes.appointments import appointments
from app.api.v1.routes.auth import signin
from fastapi import FastAPI
from app.api.v1.routes.users import users
from app.api.v1.routes.patients import patients

from app.db.firebase_client import initialize_firebase
from app.utils.middlewares import LoggingMiddleware, AuthMiddleware
from app.utils.exception_handlers import (
    app_exception_handler,
    generic_exception_handler,
)

from app.utils.exceptions import AppException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# ---------- Configuration ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "../../frontend"))

# ---------- App Setup ----------
app = FastAPI(
    title="Nithya Clinic API",
    version="1.0.0",
    description="API to manage users, patients, and appointments with Firebase backend.",
)

# ---------- Middleware ----------
app.add_middleware(LoggingMiddleware)
# app.add_middleware(AuthMiddleware)

# ---------- Exception Handlers ----------
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# ---------- API Routers ----------
app.include_router(users.router, prefix="/api/v1/users")
app.include_router(signin.router, prefix="/api/v1/auth")
app.include_router(patients.router, prefix="/api/v1/patients")
app.include_router(appointments.router, prefix="/api/v1/appointments")
app.include_router(prescription_pdf.router, prefix="/api/v1/appointments")
app.include_router(dashboard.router, prefix="/api/v1/dashboard")
app.include_router(drug_category.router, prefix="/api/v1/drug_category")
app.include_router(drug_names.router, prefix="/api/v1/drug_names")


# ---------- Static Files ----------
app.mount("/admin", StaticFiles(directory="frontend/", html=True), name="admin")


@app.get("/", include_in_schema=False)
def serve_signin():
    return FileResponse("frontend/pages/auth/signin.html")
