# utils/response.py

from fastapi import status


def success_response(message="Success", data=None):
    return {
        "success": True,
        "message": message,
        "data": data,
        "code": status.HTTP_200_OK,
    }


def created_response(message="Created", data=None):
    return {
        "success": True,
        "message": message,
        "data": data,
        "code": status.HTTP_201_CREATED,
    }


def no_content_response(message="No Content", data=None):
    return {
        "success": True,
        "message": message,
        "data": data,
        "code": status.HTTP_204_NO_CONTENT,
    }


def not_modified_response(message="Not Modified", data=None):
    return {
        "success": False,
        "message": message,
        "data": data,
        "code": status.HTTP_304_NOT_MODIFIED,
    }


def bad_request_response(message="Bad Request", data=None):
    return {
        "success": False,
        "message": message,
        "data": data,
        "code": status.HTTP_400_BAD_REQUEST,
    }


def not_found_response(message="Not Found", data=None):
    return {
        "success": False,
        "message": message,
        "data": data,
        "code": status.HTTP_404_NOT_FOUND,
    }


def internal_server_error_response(message="Internal Server Error", data=None):
    return {
        "success": False,
        "message": message,
        "data": data,
        "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
    }


def unauthorized_response(message="Unauthorized", data=None):
    return {
        "success": False,
        "message": message,
        "data": data,
        "code": status.HTTP_401_UNAUTHORIZED,
    }


def forbidden_response(message="Forbidden", data=None):
    return {
        "success": False,
        "message": message,
        "data": data,
        "code": status.HTTP_403_FORBIDDEN,
    }


def conflict_response(message="Conflict", data=None):
    return {
        "success": False,
        "message": message,
        "data": data,
        "code": status.HTTP_409_CONFLICT,
    }


def not_implemented_response(message="Not Implemented", data=None):
    return {
        "success": False,
        "message": message,
        "data": data,
        "code": status.HTTP_501_NOT_IMPLEMENTED,
    }


def service_unavailable_response(message="Service Unavailable", data=None):
    return {
        "success": False,
        "message": message,
        "data": data,
        "code": status.HTTP_503_SERVICE_UNAVAILABLE,
    }


def gateway_timeout_response(message="Gateway Timeout", data=None):
    return {
        "success": False,
        "message": message,
        "data": data,
        "code": status.HTTP_504_GATEWAY_TIMEOUT,
    }
