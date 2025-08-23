import time
from app.utils.logger import logger
from fastapi import APIRouter, HTTPException, status, Request
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from firebase_admin import firestore
from fastapi import Query

from app.db.firebase_client import db  # your Firestore DB instance

router = APIRouter(tags=["Drug Names"])


# -------------Add Drug Names----------------
class DrugNames(BaseModel):
    drugNames: List[str] = Field(..., alias="drugNames")
    drugCategoryIds: List[str] = Field(
        ...,
        alias="drugCategoryIds",
    )
    drugCategoryNames: List[str] = Field(
        ...,
        alias="drugCategoryNames",
    )


@router.post("/add_drug_names")
async def add_drug_names(payload: DrugNames):
    try:
        drug_names = payload.drugNames
        drug_categoryIds = payload.drugCategoryIds
        drug_category_names = payload.drugCategoryNames

        if len(drug_names) != len(drug_categoryIds):
            raise HTTPException(
                status_code=400, detail="Mismatched drug names and categories."
            )

        count_ref = db.collection("Count").document("count")
        drug_names_ref = db.collection("Drug_Names")

        transaction = db.transaction()

        @firestore.transactional
        def transaction_function(transaction):
            count_snapshot = count_ref.get(transaction=transaction)
            current_count = (
                count_snapshot.to_dict().get("DrugNamesCount", 0)
                if count_snapshot.exists
                else 0
            )

            for i, (name, categoryId, categoryName) in enumerate(
                zip(drug_names, drug_categoryIds, drug_category_names)
            ):
                new_count = current_count + i + 1
                doc_id = str(new_count)

                doc_data = {
                    "DrugNameId": doc_id,
                    "DrugName": name.upper(),
                    "DrugCategoryId": categoryId,
                    "DrugCategoryName": categoryName.upper(),
                    "LogDateTime": firestore.SERVER_TIMESTAMP,
                }

                doc_ref = drug_names_ref.document(doc_id)
                transaction.set(doc_ref, doc_data)

            # Update counter
            transaction.update(
                count_ref, {"DrugNamesCount": current_count + len(drug_names)}
            )

        transaction_function(transaction)

        return {
            "success": True,
            "message": f"{len(drug_names)} drug name(s) added successfully.",
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add drug names: {str(e)}",
        )


# -------------View Drug Names----------------
@router.get("/view_and_search_drug_names")
async def view_and_search_drug_names(
    search_type: Optional[str] = Query(None),
    search_value: Optional[str] = Query(None),
    cursor: Optional[str] = Query(None),
    limit: int = 10,
):
    """
    API to view and search drug names.
    """
    start_time = time.perf_counter()
    try:
        # Get total patient count from count document
        drug_count_doc = db.collection("Count").document("count").get()
        total_docs = (
            drug_count_doc.to_dict().get("DrugNamesCount", 0)
            if drug_count_doc.exists
            else 0
        )
        # if drug_count_doc.exists:
        #     total_docs = drug_count_doc.to_dict().get("DrugNamesCount", 0)
        # else:
        #     total_docs = 0

        fields = [
            "DrugCategoryName",
            "DrugCategoryId",
            "DrugCategoryName",
            "DrugName",
            "LogDateTime",
        ]

        collection_ref_field = db.collection("Drug_Names")
        collection_ref = collection_ref_field.select(fields)

        print("total_docs", total_docs)

        # Build query based on search type
        if search_type == "drug_name" and search_value:
            query = (
                collection_ref.order_by("DrugName")
                .start_at([search_value])
                .end_at([search_value + "\uf8ff"])
            )
        elif search_type == "drug_category" and search_value:
            query = (
                collection_ref.order_by("DrugCategoryName")
                .start_at([search_value])
                .end_at([search_value + "\uf8ff"])
            )
        else:
            query = collection_ref.order_by("LogDateTime", direction="DESCENDING")

        # Apply cursor for pagination
        if cursor:
            cursor_doc = collection_ref_field.document(cursor).get()
            if cursor_doc.exists:
                query = query.start_after(cursor_doc)
            else:
                logger.warning(
                    f"⚠️ Cursor doc {cursor} not found. Starting from beginning."
                )

        query = query.limit(limit)
        docs = query.get()

        # print("docs===", docs)
        # Determine next cursor
        next_cursor = docs[-1].id if len(docs) == limit else None
        results = [doc.to_dict() | {"doc_id": doc.id} for doc in docs]

        elapsed_time = time.perf_counter() - start_time
        print(f"⏱ Service execution time for Drug Name: {elapsed_time:.4f} seconds")

        return {
            "success": True,
            "data": results,
            "next_cursor": next_cursor,
            "total_count": total_docs,
        }

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------Fecth Drug Names Only----------------
@router.get("/fetch_drug_names")
def fetch_drug_names():
    try:
        # Get only the DrugName field
        collection_ref = db.collection("Drug_Names").select(["DrugName"])
        docs = collection_ref.get()

        # Extract DrugName and doc_id
        results = [{"DrugName": doc.get("DrugName")} for doc in docs if doc.get()]

        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch drug names: {str(e)}",
        )


# -------------Edit Drug Name----------------
class DrugName(BaseModel):
    drugNameId: str
    drugName: str = Field(..., alias="drugName")


@router.post("/edit_drug_names")
async def edit_drug_names(payload: DrugName):
    """
    Edit an existing Drug Name in Firestore using a transaction.
    """
    try:
        print(f"Editing drug Name with ID: {payload.drugNameId}")
        if not payload.drugNameId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Drug Name ID is required.",
            )
        drug_collection_ref = db.collection("Drug_Names")
        drug_doc_ref = drug_collection_ref.document(payload.drugNameId)

        @firestore.transactional
        def transaction_function(transaction):
            # Fetch the existing document
            drug_snapshot = drug_doc_ref.get(transaction=transaction)
            if not drug_snapshot.exists:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Drug Name with ID {payload.drugNameId} not found.",
                )

            # Update the document with new data
            transaction.update(
                drug_doc_ref,
                {
                    "DrugName": payload.drugName.upper(),
                },
            )

            return drug_snapshot.to_dict()

        # Start and run transaction
        transaction = db.transaction()
        saved_data = transaction_function(transaction)

        return {
            "success": True,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add drug Name: {str(e)}",
        )


# -----------------Delete Drug Name-----------------
@router.delete("/delete/{drug_name_id}")
def delete_drug_name(drug_name_id: str):
    try:
        doc_ref = db.collection("Drug_Names").document(drug_name_id)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=404, detail="Drug Name not found")

        doc_ref.delete()
        db.collection("Count").document("count").update(
            {"DrugNamesCount": firestore.Increment(-1)}
        )

        return {"success": True, "message": "Drug Name deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to delete Drug Name: {str(e)}"
        )
