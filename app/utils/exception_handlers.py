# utils/exception_handlers.py

from fastapi import Request, status
from fastapi.responses import JSONResponse

from app.utils.exceptions import AppException

# from app.utils.response import error_response
from app.utils.logger import logger


async def app_exception_handler(request: Request, exc: AppException):
    """
    Handles all custom AppExceptions.
    """
    logger.error(f"AppException at {request.url.path}: {exc.message}")
    return JSONResponse(
        # status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "data": None,
            "code": exc.status_code,
        },
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """
    Handles unexpected non-custom exceptions.
    """
    logger.error(f"Unhandled Exception at {request.url.path}: {str(exc)}")
    return JSONResponse(
        # status_code=500,
        content={
            "success": False,
            "message": "Internal Server Error",
            "data": None,
            "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
        },
    )
