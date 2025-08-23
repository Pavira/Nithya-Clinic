import sys
import threading
import uvicorn
import webview
import time
import webbrowser

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


def resource_path(relative_path):
    """Get absolute path to resource, works for dev and for PyInstaller EXE"""
    try:
        base_path = sys._MEIPASS  # When running as .exe
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)


# ---------- Configuration ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "../../frontend"))
FRONTEND_DIR = resource_path("frontend")


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
app.mount("/admin", StaticFiles(directory=FRONTEND_DIR, html=True), name="admin")


# @app.get("/", include_in_schema=False)
# def serve_signin():
#     # return FileResponse("frontend/pages/auth/signin.html")
#     return FileResponse(os.path.join(FRONTEND_DIR, "pages/auth/signin.html"))


@app.get("/", include_in_schema=False)
def serve_signin():
    return FileResponse(resource_path("frontend/pages/auth/signin.html"))


# ---------- Run FastAPI in a thread ----------
def start_server():
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")


# ---------- Entry point ----------
# -----------------For Local host ----------------
if __name__ == "__main__":
    # Start FastAPI in a background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Give server a moment to start
    time.sleep(2)

    # Open browser in fullscreen mode
    url = "http://127.0.0.1:8000/"
    try:
        # Try to launch Chrome in fullscreen (kiosk) mode
        os.system(f"start chrome --start-fullscreen {url}")
    except Exception:
        # Fallback: open default browser
        webbrowser.open(url)

    # Keep the script alive
    while True:
        time.sleep(1)

# -------------For EXE-------------
# if __name__ == "__main__":
#     # Run FastAPI in a background thread
#     server_thread = threading.Thread(target=start_server, daemon=True)
#     server_thread.start()

#     # Open WebView as desktop app
#     webview.create_window(
#         "Nithya Clinic",
#         "http://127.0.0.1:8000/",
#         width=1200,
#         height=800,
#         resizable=True,
#     )
#     webview.start()
