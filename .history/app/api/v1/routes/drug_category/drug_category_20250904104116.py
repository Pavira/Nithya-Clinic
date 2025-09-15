import time
from app.utils.logger import logger
from fastapi import APIRouter, HTTPException, Query, status, Request
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from firebase_admin import firestore

from app.db.firebase_client import db  # your Firestore DB instance

router = APIRouter(tags=["Drug Category"])


# -------------Add Drug Category----------------
class DrugCategory(BaseModel):
    # drugCategoryName: str = Field(..., example="ANTIBIOTICS")
    descriptions: List[str] = Field(..., alias="descriptions")


@router.post("/add_drug_category")
async def add_drug_category(payload: DrugCategory):
    """
    Add a new Template to Firestore using a transaction.
    Ensures unique ID and consistent count updates.
    """
    try:

        descriptions = payload.descriptions
        count_doc_ref = db.collection("Count").document("count")
        drug_collection_ref = db.collection("Drug_Category")

        transaction = db.transaction()

        @firestore.transactional
        def transaction_function(transaction):
            # Fetch current count (or initialize if not exists)
            count_snapshot = count_doc_ref.get(transaction=transaction)
            current_count = (
                count_snapshot.to_dict().get("DrugCategoryCount", 0)
                if count_snapshot.exists
                else 0
            )

            # for i, (name) in enumerate(zip(drug_names)):
            for i, name in enumerate(descriptions):
                new_count = current_count + i + 1
                doc_id = str(new_count)

                doc_data = {
                    "DrugCategoryId": doc_id,
                    "Description": name.upper(),
                    # "Description_lower_case": name.lower(),
                    "LogDateTime": firestore.SERVER_TIMESTAMP,
                }

                doc_ref = drug_collection_ref.document(doc_id)
                transaction.set(doc_ref, doc_data)

            # Update counter
            transaction.update(
                count_doc_ref, {"DrugCategoryCount": current_count + len(descriptions)}
            )

        transaction_function(transaction)

        return {
            "success": True,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add template: {str(e)}",
        )


# -------------------------Check Duplicate Bulk-------------------------
class DrugCategoryRequest(BaseModel):
    drugCategories: list[str]


@router.post("/check_duplicates_bulk")
async def check_duplicates_bulk(request: DrugNamesRequest):
    try:
        duplicates = []
        for name in request.drugNames:
            query = (
                db.collection("Drug_Names").where("DrugName", "==", name.upper()).get()
            )
            if len(query) > 0:
                duplicates.append(name)

        if duplicates:
            return {"success": False, "duplicates": duplicates}
        return {"success": True, "duplicates": []}

    except Exception as e:
        logger.error(f"❌ Failed bulk duplicate check: {str(e)}")
        return {"success": False, "error": "Server error"}


# -------------------------Check Duplicate PaDrug Name-------------------------
@router.get("/check_duplicate_drug_name")
async def check_duplicate_drug_service(
    drug_name: str,
):
    # logger.info(f"Querying for name={full_name.upper()} phone={phone_number}")

    try:
        query = (
            db.collection("Drug_Names").where("DrugName", "==", drug_name.upper()).get()
        )

        # Check if any documents match
        if len(query) > 0:
            return True  # Duplicate exists
        else:
            return False  # No duplicate

    except Exception as e:
        logger.error(f"❌ Failed to check duplicate drug name: {str(e)}")


# -------------Edit Drug Category----------------
class DrugCategory(BaseModel):
    drugCategoryId: str
    # drugCategoryName: str = Field(..., example="ANTIBIOTICS")
    description: str = Field(..., alias="description")


# -------------Edit Drug Category----------------
@router.post("/edit_drug_category")
async def edit_drug_category(payload: DrugCategory):
    """
    Edit an existing Templates in Firestore using a transaction.
    """
    try:
        print(f"Editing template with ID: {payload.drugCategoryId}")
        if not payload.drugCategoryId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="template ID is required.",
            )
        drug_collection_ref = db.collection("Drug_Category")
        drug_doc_ref = drug_collection_ref.document(payload.drugCategoryId)

        @firestore.transactional
        def transaction_function(transaction):
            # Fetch the existing document
            drug_snapshot = drug_doc_ref.get(transaction=transaction)
            if not drug_snapshot.exists:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"template with ID {payload.drugCategoryId} not found.",
                )

            # Update the document with new data
            transaction.update(
                drug_doc_ref,
                {
                    # "DrugCategoryName": payload.drugCategoryName.upper(),
                    "Description": payload.description,
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
            detail=f"Failed to add drug category: {str(e)}",
        )


# -------------View Drug Names----------------
@router.get("/view_and_search_drug_category")
async def view_and_search_drug_category(
    search_type: Optional[str] = Query(None),
    search_value: Optional[str] = Query(None),
    cursor: Optional[str] = Query(None),
    limit: int = 10,
):
    """
    API to view and search Category Name (separated logic for search vs normal listing).
    """
    start_time = time.perf_counter()
    try:
        fields = [
            "Description",
            "DrugCategoryId",
            "LogDateTime",
        ]

        collection_ref_field = db.collection("Drug_Category")
        collection_ref = collection_ref_field.select(fields)

        # ------------------ 🔍 SEARCH MODE ------------------
        if search_type and search_value:
            if search_type == "category_name":
                query = (
                    collection_ref.order_by("Description")
                    .start_at([search_value])
                    .end_at([search_value + "\uf8ff"])
                )
            else:
                query = collection_ref.order_by("LogDateTime", direction="DESCENDING")

            if cursor:
                cursor_doc = collection_ref_field.document(cursor).get()
                if cursor_doc.exists:
                    query = query.start_after(cursor_doc)

            query = query.limit(limit)
            docs = query.get()

            results = [doc.to_dict() | {"doc_id": doc.id} for doc in docs]
            # next_cursor = docs[-1].id if len(docs) == limit else None

            return {
                "success": True,
                "data": results,
                "next_cursor": None,
                "total_count": len(results),
            }

        # ------------------ 📄 NORMAL LISTING MODE ------------------
        else:
            drug_count_doc = db.collection("Count").document("count").get()
            total_docs = (
                drug_count_doc.to_dict().get("DrugCategoryCount", 0)
                if drug_count_doc.exists
                else 0
            )

            query = collection_ref.order_by("LogDateTime", direction="DESCENDING")

            if cursor:
                cursor_doc = collection_ref_field.document(cursor).get()
                if cursor_doc.exists:
                    query = query.start_after(cursor_doc)

            query = query.limit(limit)
            docs = query.get()

            results = [doc.to_dict() | {"doc_id": doc.id} for doc in docs]
            next_cursor = docs[-1].id if len(docs) == limit else None

            return {
                "success": True,
                "data": results,
                "next_cursor": next_cursor,
                "total_count": total_docs,
            }

    except Exception as e:
        logger.error(f"❌ Error in view_and_search_drug_category: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# @router.get("/view_and_search_drug_category")
# async def view_and_search_drug_category(
#     search_type: Optional[str] = Query(None),
#     search_value: Optional[str] = Query(None),
#     cursor: Optional[str] = Query(None),
#     limit: int = 10,
# ):
#     """
#     API to view and search Category Name.
#     """
#     start_time = time.perf_counter()
#     try:
#         # Get total patient count from count document
#         drug_count_doc = db.collection("Count").document("count").get()
#         total_docs = (
#             drug_count_doc.to_dict().get("DrugCategoryCount", 0)
#             if drug_count_doc.exists
#             else 0
#         )

#         fields = [
#             "Description",
#             "DrugCategoryId",
#             "LogDateTime",
#         ]

#         collection_ref_field = db.collection("Drug_Category")
#         collection_ref = collection_ref_field.select(fields)

#         print("total_docs", total_docs)

#         # Build query based on search type
#         if search_type == "category_name" and search_value:
#             # search_value = search_value.lower()
#             query = (
#                 collection_ref.order_by("Description")
#                 .start_at([search_value])
#                 .end_at([search_value + "\uf8ff"])
#             )
#         else:
#             query = collection_ref.order_by("LogDateTime", direction="DESCENDING")

#         # Apply cursor for pagination
#         if cursor:
#             cursor_doc = collection_ref_field.document(cursor).get()
#             if cursor_doc.exists:
#                 query = query.start_after(cursor_doc)
#             else:
#                 logger.warning(
#                     f"⚠️ Cursor doc {cursor} not found. Starting from beginning."
#                 )

#         query = query.limit(limit)
#         docs = query.get()

#         # print("docs===", docs)
#         # Determine next cursor
#         next_cursor = docs[-1].id if len(docs) == limit else None
#         results = [doc.to_dict() | {"doc_id": doc.id} for doc in docs]

#         elapsed_time = time.perf_counter() - start_time
#         print(f"⏱ Service execution time for Drug Category: {elapsed_time:.4f} seconds")

#         return {
#             "success": True,
#             "data": results,
#             "next_cursor": next_cursor,
#             "total_count": total_docs,
#         }

#     except Exception as e:
#         logger.error(f"❌ Error: {e}")
#         raise HTTPException(status_code=500, detail=str(e))


# # -------------View Drug Category----------------
# @router.get("/view_drug_category")
# async def view_drug_category():
#     """
#     Retrieve all drug categories from Firestore.
#     """
#     try:
#         drug_collection_ref = db.collection("Drug_Category")
#         drug_categories = drug_collection_ref.order_by(
#             "DrugCategoryId", direction=firestore.Query.DESCENDING
#         ).stream()

#         categories = []
#         for doc in drug_categories:
#             category_data = doc.to_dict()
#             # category_data["id"] = doc.id  # Add document ID to the data
#             categories.append(category_data)

#         return {
#             "success": True,
#             "data": categories,
#         }

#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Failed to retrieve drug categories: {str(e)}",
#         )


# -----------------Delete Drug Category-----------------
@router.delete("/delete/{category_id}")
def delete_drug_category(category_id: str):
    try:
        doc_ref = db.collection("Drug_Category").document(category_id)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=404, detail="Drug category not found")

        doc_ref.delete()
        db.collection("Count").document("count").update(
            {"DrugCategoryCount": firestore.Increment(-1)}
        )

        return {"success": True, "message": "Category deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to delete category: {str(e)}"
        )


# -------------Get Drug Category Descriptions----------------
@router.get("/{category_id}/descriptions")
async def get_drug_category_descriptions(category_id: str):
    """
    Retrieve descriptions for a specific drug category.
    """
    try:
        doc_ref = db.collection("Drug_Category").document(category_id)
        doc_snapshot = doc_ref.get()

        if not doc_snapshot.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Drug category with ID {category_id} not found.",
            )

        data = doc_snapshot.to_dict()
        descriptions = data.get("Description", [])

        return {
            "success": True,
            "data": descriptions,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve drug category descriptions: {str(e)}",
        )
