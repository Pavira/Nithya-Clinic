from fastapi import APIRouter

from datetime import datetime, timedelta
from fastapi import HTTPException
from app.db.firebase_client import db

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard")
async def dashboard(start_date: str, end_date: str):
    global db
    try:
        # Parse string to datetime
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = (
            datetime.strptime(end_date, "%Y-%m-%d")
            + timedelta(days=1)
            - timedelta(seconds=1)
        )

        print("Date----", start_dt, end_dt)

        query = (
            db.collection("collection_PatientAppointment")
            .where("LogDateTime", ">=", start_dt)
            .where("LogDateTime", "<=", end_dt)
        )

        docs = query.stream()
        data = [doc.to_dict() for doc in docs]

        print("data===", data)

        outpatient_count = 0
        outpatient_fees = 0
        outprocedure_count = 0
        outprocedure_fees = 0

        for doc in data:
            category = doc.get("AppointmentCategory", "")
            fees = doc.get("DoctorFees", 0)
            if category == "Out Patient":
                outpatient_count += 1
                outpatient_fees += fees
            elif category == "Out Patient + Procedure":
                outprocedure_count += 1
                outprocedure_fees += fees

        print(outpatient_count, outpatient_fees, outprocedure_count, outprocedure_fees)

        return {
            "success": True,
            "out_patient": {"count": outpatient_count, "fees": outpatient_fees},
            "out_procedure": {"count": outprocedure_count, "fees": outprocedure_fees},
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
