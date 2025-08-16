from fastapi import APIRouter

from datetime import datetime, timedelta
from fastapi import HTTPException
import pytz
from app.db.firebase_client import db

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard")
async def dashboard(start_date: str, end_date: str):
    global db
    try:

        # Parse string to datetime
        # start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        # end_dt = (
        #     datetime.strptime(end_date, "%Y-%m-%d")
        #     + timedelta(days=1)
        #     - timedelta(seconds=1)
        # )

        # print("Date----", start_dt, end_dt)

        tz = pytz.timezone("Asia/Kolkata")

        if not start_date or not end_date:
            # If no filter provided, use today's full range
            today = datetime.now(tz).date()
            start_dt = tz.localize(datetime.combine(today, datetime.min.time()))
            end_dt = tz.localize(datetime.combine(today, datetime.max.time()))
        else:
            # Convert input dates to localized datetime
            start_dt = tz.localize(datetime.strptime(start_date, "%Y-%m-%d"))
            end_dt = tz.localize(datetime.strptime(end_date, "%Y-%m-%d")) + timedelta(
                hours=23, minutes=59, seconds=59
            )

        query = (
            db.collection("collection_PatientAppointment")
            .where("AppointmentDateTime", ">=", start_dt)
            .where("AppointmentDateTime", "<=", end_dt)
        )

        docs = query.stream()
        data = [doc.to_dict() for doc in docs]

        # print("data===", data)

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


# 🔹 Example drug list (can later come from request body, CSV, etc.)
DRUG_LIST = [
    "DALACIN C 300MG CAP",
    "AMLONG 2.5MG TAB",
    "GABANTIN 100MG TAB",
    "ASCAZIN 50MG TABLETS",
    "ANTHOCYN -TX TABLET",
    "ATARAX 25MG TABLET",
    "ANTOXID -HC 30MG CAPSULES",
    "AUGMENTIN 625 MG TABLET",
    "AQUASOL A CAP",
    "AZORAN 50MG TABLET",
    "ANDROANAGEN TABLET",
    "APREZO 30MG TABLET",
    "AIR 180 TABLET",
    "BECOSULES 10MG CAPSULES",
    "BIFILAC 30MG CAPSULES",
    "CHYMORAL FORTE 1MG TABLET",
    "CANTHEX 200MG TABLET",
    "CIPLOX 500MG TABLETS",
    "CEASTRA XL 100MG TABLET",
    "DOLO 650 TABLET",
    "DAFLON 500MG TABLET",
    "DAZIT 10MG TABLET",
    "FINAX 1MG",
    "FOLVITE 5MG TABLET",
    "FOLLIHAIR TABLET",
    "FOLITRAX 5MG TABLET",
    "GLYCOMET 500MG TABLET",
    "GRAMOCEF O200MG",
    "H-VIT FORTE 10MG",
    "HHOMEGA + 300MG",
    "HCQS 200MG",
    "ITRASYS 100MG",
    "IVERMECTOL 12MG TABLET",
    "KERAGLO EVA TABLET",
    "KERAGLO MEN TABLET",
    "KERABLAK 200MG TABLET",
    "LOGISIL 500MG",
    "LIVOGEN 50MG",
    "LIMCEE 500MG",
    "LIZOFORCE 600MG",
    "MICRODOX LBX 100MG",
    "MICROBACT 500MG",
    "METROGYL 400MG",
    "NEUGABA 75MG",
    "NIXIYAX 150 MG",
    "PANTOCID 20MG",
    "PROANANGEN",
    "PAN MAX",
    "RENERVE PLUS",
    "SOTRET 10MG",
    "SOTRET 20MG",
    "SYNTRAN 200MG",
    "SHELCAL HD 500MG",
    "SYNTRAN 100MG",
    "TRICHO 5MG",
    "TELEKAST 10MG",
    "TRAXIDO SR 500MG",
    "VALTOVAL 1G",
    "VITIBEX 300MG",
    "WYSOLONE 10MG",
    "XYZAL 5MG",
    "XYZAL -M",
    "ZOVIRAX 400MG",
    "ZERODOL P",
    "ZERODOL SP",
    "ZEMPRED 8MG",
    "ZEMPRED 4MG",
    "ZOVIRAX 800MG",
    "MEDROL 4 MG",
    "SHELCAL OS 500 MG",
    "LOPAMID",
    "REVAS 50MG",
    "BEPLEX FORTE",
    "LEFNO 10MG",
    "OMEZ 20MG",
    "NEBISTAR 5 MG",
    "TRYPTOMER 10MG",
    "BILASHINE 20MG TABLET",
    "TAYO 60K",
    "DOMSTAL 10MG",
    "AZKERA TABLET",
    "JAKAUTO TAB 5MG",
    "RANTAC 150",
    "EMESET 4MG TABLET",
    "CILACAR 10MG TABLET",
    "DAPSONE 100 MG TABLET",
    "CLOFROS-100MG CAPSULES",
    "CLOFROS 50MG CAPSULES",
    "RCIN 600MG",
    "SYNTRAN SB 50MG",
    "IVERCID-12MG",
    "EBONY TABLET",
    "TELEKAST 4 MG",
    "PRUCROS 20MG",
    "ALTRADAY CAPSULES",
    "NICOGLOW TABLET",
    "TELMA 20/MG",
    "TECZINE 5MG",
    "TRYPTOMER 25MG",
    "BILATIS M TAB",
    "JUNIOR-LANZOL 30MG",
    "PHLOGAM",
    "ATEN 50MG",
    "OLMEZEST CH 40",
    "MOXOVAS 0.3MG",
    "PRADAXA 75MG CAPS",
    "ITRATUF 100MG CAPSULES",
    "OMNACORTIL 2.5MG",
    "SHELCAL 500MG",
    "ALLEGRA 180MG TABLET",
    "SOTRET NF 16MG",
    "SOTRET NF 8 MG",
    "NUTRICAP H",
    "VITIBEX KID TABLET",
    "CORSANGO-D3 TABLETS",
    "ELDOPAR CAP",
    "PHEXIN 500MG CAP",
    "PRODEP 20MG",
    "AZTOLET 10MG",
    "ZIMIG TABLET 250 MG",
    "ITRALASE 100MG TABLET",
    "IVOBLAK TABLET",
    "ITASPOR SB CAPS",
    "BTN ULTRA TABLET",
    "SOMPRAZ 40 MG",
    "DOXT SL CAP",
    "HEPTAGON TAB",
    "IMINORAL 50",
    "OSTEOFOS 70MG",
    "NOVANIB-T",
    "CANDIFORCE SB 130MG",
    "CURLZVIT TAB",
    "CEPODEM 200MG TAB",
    "BILASHINE M",
    "FIXTRAL SB 100MG",
    "ACROTAC CAP 10MG",
    "SYNTRAN SB 65 MG CAPS",
    "CEASTRA SB 65MG CAP",
    "ITZHH-SB 65MG CAP",
    "ATOGLA PROBIO OD CAPS",
    "ITRAGREAT SB 65MG",
    "ATARAX SR 50MG",
    "ITRASYS SB 65MG",
    "NUROKIND PLUS RF CAPS",
    "THALIX 100MG CAP",
    "GOLITE OSP CAP",
    "FAA 20MG TAB",
    "SPECTRA 10MG",
    "IMINORAL 100 MG",
    "VIBACT DS CAP",
    "PRODEP 10MG CAPS",
    "SPECTRA 25MG",
    "AZEE 500MG",
    "WYSOLONE 5MG",
    "UPOMEGA SOFTGEL CAP 30",
    "BITOZED TABLETS 15 TAB",
    "ISOTROIN 20 CAPS",
    "ZTI SB 65MG",
    "HAIRBLESS-DIVA TAB 10S",
    "PAN D CAP 15S",
    "PX7 TAB",
    "REVIBRA C10",
    "SERTA 20G",
    "AF-150 MG TABLET",
    "AF-400 MG TABLET",
    "ETHIGLO PLUS TABLET",
    "ZENTEL",
    "ELTROXIN 50MG",
    "ELTROXIN 25MG",
    "THYROX 50MG",
    "THYROX 25 MG",
    "TAYO DERMA 60K",
    "NEUROCETAM 400MG",
    "BILASURE M",
    "ITZHH SB 130MG CAP",
]

# DRUG_LIST = [
#     "ACNEUV GEL 30G",
#     "ACMIST moisturising cream 50G",
#     "ANTHOCYN TX CREAM 30G",
#     "ATARAX ANTI ITCH LOTION 100ML",
#     "AF-K 100ML SHAMPOO",
#     "AHAGLOW 50G",
#     "AHAGLOW MOISTURISING GEL 50G",
#     "ALDRY LOTION 150G",
#     "BENZONIX GEL WASH 50GM",
#     "AQUA OAT MOISTURIZING CREAM 100G",
#     "ACNE UV GEL 50G",
#     "ACNESOL A NANO GEL 15G",
#     "ASCAZIN SYRUP 70 ML",
#     "AF-K 60ML SHAMPOO",
#     "BRISTAA CREAM 20G",
#     "BRILANTE 30ML",
#     "B-4 NAPPI CREAM 75G",
#     "CALOSOFT -AF LOTION 100ML",
#     "CETAPHIL GENTLE SKIN CLEANSER125ML",
#     "CETAPHIL OILY SKIN CLEANSER 125ML",
#     "CETAPHIL RESTORADERM 295ML",
#     "CETAPHIL MOIS 100ML LOTION",
#     "CLEAR GEL 20G",
#     "CUTIYT-G6 CREAM 20G",
#     "CLEARZNEW CREAM",
#     "C-WIN CREAM",
#     "C GRO SERUM 60ML",
#     "CANDID- B 10G CREAM",
#     "CANDID-50G CREAM",
#     "CANDID MOUTH PAINT 25ML",
#     "CANDIDOX30G CREAM",
#     "COSMELITE NEXT 30G CREAM",
#     "CUTICAPIL STEM 60ML",
#     "CLINDAC A GEL 20",
#     "DERIVA- CMS GEL 15G",
#     "DERIVA- BPO GEL 15G",
#     "DESOWEN 30ML LOTION",
#     "DERMA DEW ACNE SOAP 125 G",
#     "DERMA DEW LITE 75G",
#     "DEMELAN LITE LOTION 50ML",
#     "DERSOL 24% 25G",
#     "EGA 30G",
#     "EFFICORT 10G",
#     "EUMOSONE -M CREAM 15G",
#     "EYE GLOW UNDER EYE GEL 20G",
#     "EBONY 100ML",
#     "EFLORA 15G CREAM",
#     "EXCELA MAX 200 ML",
#     "FUNGICIDE 90ML SHAMPOO",
#     "FLONIDA 5%10G CREAM",
#     "FLUTIBACT 10G OINTMENT",
#     "FLUTIVATE 20G OINTMENT",
#     "FUDIC 10G CREAM",
#     "FUCIBET 15G CREAM",
#     "D ACNE SOFT GEL 100GM",
#     "GLYCO 6 CREAM",
#     "GLOGEOUS FACE WASH 100ML",
#     "MINICHEK AHL SHAMPOO 100ML",
#     "HALOVATE- F CREAM 15G",
#     "ACNORM LOTION 180ML",
#     "IVREA 30G CREAM",
#     "IVREA 30L SHAMPOO",
#     "KERA XL 60ML SERUM",
#     "KOJIVIT 15G",
#     "JAKAUTO GEL 2% 10GM",
#     "KZ 30G CREAM",
#     "KZ 125 G SOAP",
#     "KENACORT INJ 10MG",
#     "KENACORT ORAL PAST E 5G",
#     "KERA FM 60ML",
#     "KERTYOL PSO 60ML",
#     "KOJIGLO GOLD 20G",
#     "KZ LOTION 50ML",
#     "MAXRICH YU CREAM 100MG",
#     "LULIFIN 30G CREAM",
#     "LIQUID PARAFIN 100ML",
#     "LASHIELD 60G",
#     "MOMEVEN 10G CREAM",
#     "MINTOP FORTE 10% 60ML",
#     "MINTOP FORTE 5% 120ML",
#     "MELALITE 15 30G CREAM",
#     "MOMATE 15G OINTMENT",
#     "MOMATE-F 15G CREAM",
#     "MOISTUREX 100G CREAM",
#     "MOISTUREX BODY WASH 200ML",
#     "MELIPOX 100ML",
#     "MINOKEM-N 5% 60ML",
#     "MINICHEK 60ML",
#     "MX 5 50ML",
#     "NAILROX 5ML",
#     "MELANOCYL 25ML",
#     "ONABET 30G",
#     "PHOTOSTABLE ACNE CLEAR MFS 50GM",
#     "PHOTOSTABLE GOLD 50G",
#     "PERMITE 60G",
#     "PERLICE 120G",
#     "PRIOGLO EA 100ML",
#     "PRIOGLO 30G",
#     "PHOTOBAN 30 AQU 60GM",
#     "QSERA 60ML",
#     "RETIK 30G",
#     "RAYGLOW 20G",
#     "SEBAMED CLEAR FACE GEL 50ML",
#     "SEBAMED CLEAR FACE FOAM 50ML",
#     "SEBAMED LIP DEFENSE 4.8G",
#     "SCARCLIN 40G",
#     "SUNCROS SOFT 50G",
#     "STRETCH -RID 50G",
#     "SEBOWASH 100ML",
#     "SOAPEX 75G",
#     "SUNSTOP AQUA GEL 60G",
#     "SEREN 100ML SHAMPOO",
#     "SEREN CONDITIONER 100ML",
#     "VC GROF SERUM 30GM",
#     "SPOO 125ML",
#     "TACROZ FORTE 10G",
#     "TENOVATE 15G",
#     "TRETIN 0.025 30G",
#     "TRETIN 0.05 30G",
#     "TOPISAL 6 30ML",
#     "TOPISAL 6 30G OINTMENT",
#     "TEDIBAR 75G",
#     "TACROTOR 0.03 10G",
#     "TRACNIL SACHET 5G",
#     "TRICLENZ 250ML",
#     "TBACT 5G",
#     "VENUSIA MAX 150G",
#     "VITIBEX LIP GEL 20G",
#     "VITIBEX GEL 30G",
#     "WHITE FIELD 20G",
#     "WHITE UP 75G",
#     "XYZAL SYP 60ML",
#     "XGAIN 100ML",
#     "YUGARD 15G",
#     "LOGIDRUF S",
#     "DIPROBATE PLUS LOTION 50ML",
#     "FOLIFAST 100ML HAIR TINCTURA",
#     "MINICHEK F 60ML",
#     "LULINEXT CREAM 30G",
#     "CLONATE-F CRM 10GM",
#     "DOLOCAINE GEL 5 GM",
#     "LULICAN FORTE 5% LOTION",
#     "ATOGLA RESYL MOISTURIZER CREAM",
#     "TYROLITE CREAM 15GM",
#     "YES I CAN 5G",
#     "CHOLTRAN POEDER",
#     "HALOVATE LOTION 30ML",
#     "CUTICOLOR 60GM BLACK",
#     "XERINA CREAM 50GM",
#     "AQUREA HF CREAM 50G",
#     "NEXRET TC GEL",
#     "ONABET SD15ML",
#     "ANAPHASE PLUS 100M SHAMPOO",
#     "PASITREX OINT 20G",
#     "AHAGLOW FACE WASH 50G",
#     "ELOVERA BODY WASH 150ML",
#     "AQUASOFT-S BAR 75GM",
#     "KETAFUNG CT SHAMPOO",
#     "TENOVATE GN SKIN CREAM",
#     "FLUTIVATE CREAM",
#     "EBONY HAIR LOTION 50ML",
#     "REFERSH TEARSH",
#     "AHAGLOW REPAIR GEL 50G",
#     "MOMATE CREAM",
#     "AZIDERM PLUS 15GM",
#     "DESOWEN CREAM 10GM",
#     "REGEN D 150MCG 7.5GM",
#     "DERSHINE MOISTURIZING CREAM 100ML",
#     "TRICHOTON SYRUP 150ML",
#     "M-SYS OINTMENT 10GM",
#     "IMPOYZ CREAM 0.025% 20GM",
#     "AQUA OAT MOISTURIZING LOTION 100ML",
#     "POWERCORT SHAMPOO",
#     "BRISTAA INTENSE CREAM 20G",
#     "CANDID 30G CREAM",
#     "CETAPHIL DAILY EXFOLATING CLEANSER 178/ML",
#     "OLESOFT LOTION 200ML",
#     "FLONIDA 1% CREAM 10G",
#     "OLESOFT MAX LOTION 200ML",
#     "SEBAMED AD REVITALIZING SHAMPOO 200ML",
#     "CETAPHIL MOIS CREAM 80G",
#     "BANDY SUSP 10ML",
#     "LULIFIN 10",
#     "AZIDERM 20% CREAM",
#     "DIPROBATE PLUS CREAM 30G",
#     "SUNSTOP GOLD 50G",
#     "LISTERINE ORIGINAL 250ML",
#     "CROCIN DS SYRUP",
#     "EMESET SYRUP",
#     "CHEKFALL 60ML SERUM",
#     "ONABET CREAM 15G",
#     "LULICAN S CREAM",
#     "SKIN GLOW PEEL -15G",
#     "8X SHAMPOO",
#     "KOJIC SR 20GM",
#     "FACE MASK 3-PLY",
#     "GELUSIL MPS 200ML LIQ",
#     "NIZRAL SOLUTIONS 50ML",
#     "PHYSIOGEL HYPOALRGENIC CRAI LOT 100ML",
#     "ZYSHIELD 100ML",
#     "MINSCALP F MAX 10%60ML",
#     "PACROMA 10GM",
#     "TRICOGRO NEW HAIR SERUM",
#     "DERMADEW ALOE CREAM 150GM",
#     "MISONE CREAM 20GM",
#     "MOISAWAVE MOISTURIZING LOTION 250ML",
#     "ACNE OC moisturising cream 75G",
#     "NEW DEWSOFT CREAM 150GM",
#     "MOISTUREX SYNDET BAR",
#     "LZHH LOTION 30ML",
#     "TAZRET FORTE CREAM 20G",
#     "YES I CAN HAIR COLOR 80GM",
#     "LULIBRUT CREAM 25G",
#     "RITCH SPRAY 100ML",
#     "PRIOSILK HAIR SERUM 100ML",
#     "TUGAIN 5% SOLUTION",
#     "SUPIROCIN OINT 5GM",
#     "TOPISAL 6% LOTION",
#     "PHYTORAL SP LOTION",
#     "CIVADERM SHAMPOO 1/1%",
#     "ITRATUF SOLUTON 100ML",
#     "PHYSIOGEL AI BODY LOTION",
#     "MOIZ CLEANSING LOTION 200ML",
#     "PRILOX 5GM CREAM",
#     "VIVETA 5GM CREAM",
# ]


@router.post("/upload")
def upload():
    try:
        global db
        tz = pytz.timezone("Asia/Kolkata")
        now = datetime.now(tz)

        # Collection reference
        drug_ref = db.collection("Drug_Names")

        # ✅ Find current max DrugNameId (for auto-increment)
        query = drug_ref.order_by("DrugNameId", direction="DESCENDING").limit(1).get()
        if query:
            last_id = 225
        else:
            last_id = 225

        new_id = last_id
        batch = db.batch()  # 🔹 Use batch write for performance

        for drug in DRUG_LIST:
            new_id += 1
            doc_ref = drug_ref.document(str(new_id))  # 🔹 Use DrugNameId as doc ID
            batch.set(
                doc_ref,
                {
                    "DrugCategoryId": "1",
                    "DrugCategoryName": "TABLETS",
                    "DrugName": drug,
                    "DrugNameId": str(new_id),
                    "LogDateTime": now,
                },
            )
        batch.commit()

        return {
            "success": True,
            "message": f"{len(DRUG_LIST)} drugs uploaded successfully",
            "last_id": new_id,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Upload failed: {e}")
