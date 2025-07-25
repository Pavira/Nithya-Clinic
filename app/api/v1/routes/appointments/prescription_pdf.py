from fastapi import APIRouter, HTTPException, Response, Query

# from io import BytesIO
# import os
from fastapi import HTTPException, Response

# from fastapi.responses import StreamingResponse
# from firebase_admin import firestore

# from jinja2 import Environment, FileSystemLoader
# from weasyprint import HTML
from app.utils.logger import logger
from app.db.firebase_client import db

router = APIRouter()


# def generate_pdf(data: dict, output_path: str = "prescription.pdf") -> str:
#     try:
#         print("🧾 Starting PDF generation...")
#         env = Environment(loader=FileSystemLoader("app/templates"))
#         print("📁 Loaded template directory: app/templates")

#         template = env.get_template("prescription_template.html")
#         print("📄 Loaded HTML template: prescription_template.html")

#         # html_out = template.render(data=sanitize(data))
#         html_out = template.render(data=data)
#         print("🖨️ Rendering HTML to PDF...", data)

#         HTML(string=html_out).write_pdf(output_path)
#         print("✅ PDF written to:", output_path)

#         return output_path
#     except Exception as e:
#         logger.error(f"❌ Error generating PDF: {e}")
#         raise HTTPException(status_code=500, detail=str(e))


@router.get("/generate_prescription_pdf")
async def generate_prescription_pdf(appointment_id: str, reg_no: str):
    try:
        doc_ref = (
            db.collection("collection_PatientAppointment")
            .where("AppointmentRegNum", "==", appointment_id)
            .get()
        )

        if not doc_ref:
            raise HTTPException(status_code=404, detail="Appointment not found")

        user_doc_ref = (
            db.collection("collection_PatientRegistration")
            .where("PatientRegistrationNumber", "==", reg_no)
            .get()
        )
        if not user_doc_ref:
            raise HTTPException(status_code=404, detail="Patient not found")

        user_doc = user_doc_ref[0]
        user_data = user_doc.to_dict()

        doc = doc_ref[0]
        data = doc.to_dict()

        data["Age"] = user_data["Age"]
        data["Gender"] = user_data["Gender"]

        print("✅ Appointment data retrieved from Firestore.", data)

        return data

    except Exception as e:
        logger.error(f"❌ Error in PDF service: {e}")
        raise HTTPException(status_code=500, detail=str(e))
