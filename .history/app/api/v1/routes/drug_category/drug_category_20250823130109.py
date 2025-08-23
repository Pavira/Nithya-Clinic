from app.utils.logger import logger
from fastapi import APIRouter, HTTPException, status, Request
from pydantic import BaseModel, Field
from typing import List
import uuid
from firebase_admin import firestore

from app.db.firebase_client import db  # your Firestore DB instance

router = APIRouter(tags=["Drug Category"])


# -------------Add Drug Category----------------
class DrugCategory(BaseModel):
    # drugCategoryName: str = Field(..., example="ANTIBIOTICS")
    description: List[str] = Field(
        ...,
        example=["Used for bacterial infections", "Common in post-surgery treatment"],
    )


@router.post("/add_drug_category")
async def add_drug_category(payload: DrugCategory):
    """
    Add a new Template to Firestore using a transaction.
    Ensures unique ID and consistent count updates.
    """
    try:
        count_doc_ref = db.collection("Count").document("count")
        drug_collection_ref = db.collection("Drug_Category")

        @firestore.transactional
        def transaction_function(transaction):
            # Fetch current count (or initialize if not exists)
            count_snapshot = count_doc_ref.get(transaction=transaction)
            count_data = count_snapshot.to_dict() or {}

            current_count = count_data.get("DrugCategoryCount", 0)
            new_category_id = current_count + 1

            # Build new category data
            drug_data = {
                "DrugCategoryId": str(new_category_id),
                # "DrugCategoryName": payload.drugCategoryName.upper(),
                "Description": payload.description,
                "LogDateTime": firestore.SERVER_TIMESTAMP,
            }

            # Create new document with ID = new_category_id
            transaction.set(
                drug_collection_ref.document(str(new_category_id)), drug_data
            )

            # Update the count
            transaction.set(
                count_doc_ref, {"DrugCategoryCount": new_category_id}, merge=True
            )

            return drug_data

        # Start and run transaction
        transaction = db.transaction()
        saved_data = transaction_function(transaction)

        return {
            "success": True,
            # "message": f"Category '{payload.drugCategoryName}' added successfully.",
            # "data": saved_data,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add template: {str(e)}",
        )


# -------------Edit Drug Category----------------
class DrugCategory(BaseModel):
    drugCategoryId: str
    # drugCategoryName: str = Field(..., example="ANTIBIOTICS")
    description: List[str] = Field(
        ...,
        example=["Used for bacterial infections", "Common in post-surgery treatment"],
    )


# -------------Edit Drug Category----------------
@router.post("/edit_drug_category")
async def edit_drug_category(payload: DrugCategory):
    """
    Edit an existing Drug Category in Firestore using a transaction.
    """
    try:
        print(f"Editing drug category with ID: {payload.drugCategoryId}")
        if not payload.drugCategoryId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Drug Category ID is required.",
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
                    detail=f"Drug category with ID {payload.drugCategoryId} not found.",
                )

            # Update the document with new data
            transaction.update(
                drug_doc_ref,
                {
                    "DrugCategoryName": payload.drugCategoryName.upper(),
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


# -------------View Drug Category----------------
@router.get("/view_drug_category")
async def view_drug_category():
    """
    Retrieve all drug categories from Firestore.
    """
    try:
        drug_collection_ref = db.collection("Drug_Category")
        drug_categories = drug_collection_ref.order_by(
            "DrugCategoryId", direction=firestore.Query.DESCENDING
        ).stream()

        categories = []
        for doc in drug_categories:
            category_data = doc.to_dict()
            # category_data["id"] = doc.id  # Add document ID to the data
            categories.append(category_data)

        return {
            "success": True,
            "data": categories,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve drug categories: {str(e)}",
        )


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
