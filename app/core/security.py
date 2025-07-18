# # core/security.py
# from fastapi import Request, HTTPException
# from firebase_admin import auth


# async def get_current_user(request: Request):
#     """
#     Verifies Firebase ID token from Authorization header.
#     """
#     auth_header = request.headers.get("Authorization")

#     if not auth_header:
#         raise HTTPException(
#             # status_code=status.HTTP_401_UNAUTHORIZED,
#             # detail="Authorization header missing",
#         )

#     token = auth_header.split(" ")[1]  # Bearer <token>
#     try:
#         decoded_token = auth.verify_id_token(token)
#         return decoded_token
#     except Exception as e:
#         raise HTTPException(
#             # status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
#         )
