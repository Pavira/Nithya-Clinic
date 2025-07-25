from io import BytesIO
import os
from fastapi import HTTPException, Response
from fastapi.responses import StreamingResponse
from firebase_admin import firestore
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from app.utils.logger import logger
from app.db.firebase_client import db


def sanitize(data):
    # Fallbacks for null/missing values
    return {k: (v if v else "N/A") for k, v in data.items()}


def generate_pdf(data: dict, output_path: str = "prescription.pdf") -> str:
    try:
        print("🧾 Starting PDF generation...")
        env = Environment(loader=FileSystemLoader("app/templates"))
        print("📁 Loaded template directory: app/templates")

        template = env.get_template("prescription_template.html")
        print("📄 Loaded HTML template: prescription_template.html")

        # html_out = template.render(data=sanitize(data))
        html_out = template.render(data=data)
        print("🖨️ Rendering HTML to PDF...", data)

        HTML(string=html_out).write_pdf(output_path)
        print("✅ PDF written to:", output_path)

        return output_path
    except Exception as e:
        logger.error(f"❌ Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_prescription_pdf_service(appointment_id: str):
    print("🔍 Querying Firestore for appointment data...")
    try:
        doc_ref = (
            db.collection("collection_PatientAppointment")
            .where("AppointmentRegNum", "==", appointment_id)
            .get()
        )

        if not doc_ref:
            raise HTTPException(status_code=404, detail="Appointment not found")

        doc = doc_ref[0]
        data = doc.to_dict()

        print("✅ Appointment data retrieved from Firestore.", data)

        pdf_path = generate_pdf(data=data)
        print("✅ PDF successfully generated at:", pdf_path)
        with open(pdf_path, "rb") as f:
            return StreamingResponse(
                BytesIO(f.read()),
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"inline; filename={appointment_id}.pdf"
                },
            )

    except Exception as e:
        logger.error(f"❌ Error in PDF service: {e}")
        raise HTTPException(status_code=500, detail=str(e))
