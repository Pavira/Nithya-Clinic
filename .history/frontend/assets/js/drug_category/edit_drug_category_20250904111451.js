function editCategoryFunction() {
  const form = document.getElementById("edit-drug-category-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const description = formData.get("description").trim().toUpperCase();

    const categoryId = window.pageParams?.category_id;
    const oldDescription = window.pageParams?.description?.trim().toUpperCase();

    if (!categoryId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Category ID is missing. Cannot edit category.",
      });
      return;
    }

    if (description.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter description.",
      });
      return;
    }

    // ✅ Check duplicate only if description was changed
    if (description !== oldDescription) {
      showLoader();
      const isUnique = await checkDuplicateDrugCategory(description);
      hideLoader();

      if (!isUnique) {
        Swal.fire({
          icon: "warning",
          title: "⛔ Already exists in database",
          text: `"${description}" is already saved.`,
        });
        return;
      }
    }

    const requestData = {
      drugCategoryId: categoryId,
      description,
    };

    console.log("Request Data:", requestData);

    showLoader();
    const token = localStorage.getItem("token");
    fetch("/api/v1/drug_category/edit_drug_category", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        hideLoader();
        if (data.success) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: `Template updated successfully!`,
            confirmButtonText: "OK",
          }).then(async (result) => {
            if (result.isConfirmed) {
              await fetchInstructions();
              loadPage("drug_category/view_drug_category");
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.message || "Failed to update template.",
          });
        }
      })
      .catch((error) => {
        hideLoader();
        console.error("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "An unexpected error occurred.",
        });
      })
      .finally(() => {
        hideLoader();
      });
  });
}

// ----------- Reuse duplicate check function from add-page -----------
async function checkDuplicateDrugCategory(description) {
  try {
    const token = localStorage.getItem("token");
    const url = `/api/v1/drug_category/check_duplicate_category?description=${encodeURIComponent(
      description
    )}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      await Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Your session has expired. Please sign in again.",
      });
      localStorage.removeItem("token");
      window.location.href = "/";
      return true; // treat as unique (session expired)
    }

    const result = await response.json();
    return !result; // true if unique, false if duplicate
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "⛔ Server error. Try again later.",
    });
    return false; // block on error
  } finally {
    hideLoader();
  }
}
