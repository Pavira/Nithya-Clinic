# import json
# import firebase_admin
# from firebase_admin import credentials, firestore, storage
# import os
# import sys


# firebase_app = None
# db = None
# bucket = None


# # ===========================Exe file========================
# def resource_path(relative_path):
#     """Get absolute path to resource, works for dev and PyInstaller exe"""
#     try:
#         base_path = sys._MEIPASS  # PyInstaller temp folder
#         print("base_path:", base_path)
#     except Exception:
#         base_path = os.path.abspath(".")

#     return os.path.join(base_path, relative_path)


# def initialize_firebase():
#     global firebase_app, db, bucket
#     try:
#         if not firebase_admin._apps:
#             print("Firebase......")
#             # cred_path = resource_path("app/db/firebase_config.json")
#             # cred_path = resource_path("firebase_config.json")
#             cred_path = resource_path("firebase_config.json")
#             cred = credentials.Certificate(cred_path)
#             print("Firebase config path:", cred_path)
#             print("Exists?", os.path.exists(cred_path))
#             # cred = credentials.Certificate("./app/db/firebase_config.json")
#             firebase_app = firebase_admin.initialize_app(
#                 cred, {"storageBucket": "nithya-clinic.firebasestorage.app"}
#             )

#             print("Firebase app initialized:---", firebase_app)  # Add this line

#         db = firestore.client()
#         bucket = storage.bucket()

#     except FileNotFoundError:
#         print("❌Error: firebase_config.json file not found.")
#     except Exception as e:
#         print(f"❌Error initializing Firebase: {e}")


# # Automatically initialize on import
# initialize_firebase()

# ======================================Render file===============================
import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, storage

firebase_app = None
db = None
bucket = None


def initialize_firebase():
    global firebase_app, db, bucket
    try:
        if not firebase_admin._apps:
            # Load service account JSON from environment variable
            firebase_json = os.getenv("FIREBASE_CONFIG_JSON")
            if not firebase_json:
                print("❌ Environment variable FIREBASE_CONFIG_JSON not found.")
                return

            cred_dict = json.loads(firebase_json)
            cred = credentials.Certificate(cred_dict)

            firebase_app = firebase_admin.initialize_app(
                cred, {"storageBucket": f"{cred_dict['project_id']}.appspot.com"}
            )
            print("✅ Firebase app initialized.")

        db = firestore.client()
        bucket = storage.bucket()

        # 🔥 Firestore test after db is initialized
        # try:
        #     test_doc = db.collection("test").document("ping")
        #     test_doc.set({"ping": "pong"})
        #     print("✅ Firestore connection working")
        # except Exception as e:
        #     print("❌ Firestore connection failed:", e)

    except json.JSONDecodeError:
        print("❌ Error decoding FIREBASE_CONFIG JSON.")
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")


# Automatically initialize on import
initialize_firebase()
