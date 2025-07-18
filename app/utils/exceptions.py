# utils/exceptions.py


class AppException(Exception):
    def __init__(self, message="Application error occurred", status_code=400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class UserNotFoundError(AppException):
    def __init__(self, message="User not found"):
        super().__init__(message=message, status_code=404)


class ValidationError(AppException):
    def __init__(self, message="Validation failed"):
        super().__init__(message=message, status_code=422)


class InvalidLoginCredentials(AppException):
    def __init__(self, message="Invalid login credentials"):
        super().__init__(message=message, status_code=401)


# You can keep adding more custom exceptions easily like this!
