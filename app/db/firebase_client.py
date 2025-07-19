import firebase_admin
from firebase_admin import credentials, firestore, storage

firebase_app = None
db = None
bucket = None


def initialize_firebase():
    global firebase_app, db, bucket
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate("./app/db/firebase_config.json")
            firebase_app = firebase_admin.initialize_app(
                cred, {"storageBucket": "nithya-clinic.firebasestorage.app"}
            )
            print("Firebase app initialized:---", firebase_app)  # Add this line

        db = firestore.client()
        bucket = storage.bucket()
    except FileNotFoundError:
        print("❌Error: firebase_config.json file not found.")
    except Exception as e:
        print(f"❌Error initializing Firebase: {e}")


# Automatically initialize on import
initialize_firebase()


# import json
# import sys
# import firebase_admin
# from firebase_admin import credentials, firestore, storage
# import os

# firebase_app = None
# db = None
# bucket = None


# def initialize_firebase():
#     global firebase_app, db, bucket
#     try:
#         # Dynamically resolve path whether running from source or PyInstaller
#         base_path = getattr(sys, "_MEIPASS", os.path.abspath("."))
#         config_path = os.path.join(base_path, "app", "db", "firebase_config.json")

#         with open(config_path) as f:
#             config = json.load(f)

#         if not firebase_admin._apps:
#             cred = credentials.Certificate(config)
#             firebase_app = firebase_admin.initialize_app(
#                 cred,
#                 {
#                     "storageBucket": "nithya-clinic.appspot.com"
#                 },  # <- FIX: use real bucket name!
#             )
#             print("✅ Firebase initialized.")

#         db = firestore.client()
#         bucket = storage.bucket()

#     except FileNotFoundError:
#         print("❌ Error: firebase_config.json file not found.")
#     except Exception as e:
#         print(f"❌ Error initializing Firebase: {e}")


# # Automatically initialize
# initialize_firebase()
