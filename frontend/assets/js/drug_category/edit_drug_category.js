function initEditDrugCategoryPage(){

  // // checking duplicate name and phone number while typing
const drugInput = document.getElementById("description");
const submitBtn = document.getElementById("edit-drug-category-btn"); // <-- your submit button id


drugInput.addEventListener("blur", async function () {
  const description = this.value.trim().toUpperCase(); // normalize to uppercase
  const olddescription = (window.pageParams?.description || "").toUpperCase();

  // Reset state
  submitBtn.disabled = false;
  this.classList.remove("is-invalid");

  if (description) {
    // Only check if user changed the drug name
    if (description !== olddescription) {
      showLoader();
      const exists = await checkDuplicateCategory(description);
      hideLoader();

      if (!exists) {
        Swal.fire({
          icon: "warning",
          title: "⛔ Duplicate Template found",
          text: `"${description}" already exists in the database.`,
        });
        this.classList.add("is-invalid");
        submitBtn.disabled = true; // 🚫 block submission
      }
    }
  }
});

    showCategoryDetails();
    editCategoryFunction();
}

// -----------Check Duplicate category-----------
async function checkDuplicateCategory(description) {
  console.log("Checking for duplicate description...");

  try {
    const token = localStorage.getItem("token");
    const url = `/api/v1/drug_category/check_duplicate_category?description=${encodeURIComponent(description)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
        Swal.fire({
          icon: 'warning',
          title: 'Session Expired',
          text: 'Your session has expired. Please sign in again.',
        }).then(() => {
          localStorage.removeItem("token");
          window.location.href = "/"; // or your login page
        });
        return; // stop further processing
      }

    const result = await response.json();
    console.log("Duplicate check result:", result);

    if (result) {
      return false; // Duplicate found
    } else if (!result ) {
      return true; // No duplicate
    } else {
      Swal.fire({
        icon: 'error',
        title: '⛔ Error checking duplicate template',
      });
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: '⛔ Server error. Try again later.',
    });
    console.error(err);
  }finally {
    hideLoader(); // Hide the loader
  }
}


  function showCategoryDetails() {
    // const category_name = window.pageParams?.category_name;
    const description = window.pageParams?.description;    
    document.getElementById('description').value = description || '';
  }

//   Edit drug category function
function editCategoryFunction() {
  const form = document.getElementById("edit-drug-category-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const description = formData.get("description").trim().toUpperCase();
    const olddescription = (window.pageParams?.description || "").toUpperCase();

    if (!window.pageParams?.category_id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Category ID is missing. Cannot edit category.",
      });
      return;
    }

    if (!description) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter Description",
      });
      return;
    }

    try {
      let canSave = true;

      // ✅ Only check duplicate if user changed the description
      if (description !== olddescription) {
        showLoader();
        const isAvailable = await checkDuplicateCategory(description);
        hideLoader();

        if (!isAvailable) {
          Swal.fire({
            icon: "warning",
            title: "⛔ Duplicate Template found",
            text: `"${description}" already exists in database.`,
          });
          canSave = false;
        }
      }

      // ✅ If no duplicate OR unchanged, save template
      if (canSave) {
        const requestData = {
          drugCategoryId: window.pageParams?.category_id,
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
      }
    } catch (error) {
      hideLoader();
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "An unexpected error occurred.",
      });
    }
  });
}



document.getElementById('delete-drug-category-btn').addEventListener('click', function() {
  const categoryId = window.pageParams?.category_id; // Assuming the ID is passed in pageParams
  Swal.fire({
    title: 'Are you sure?',
    text: 'This action will delete the template permanently!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      showLoader();
      const token = localStorage.getItem("token");
      fetch(`/api/v1/drug_category/delete/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to delete template');
          }
          return response.json();
        })
        .then((data) => {
          // Swal.fire('', 'The template has been deleted.', 'success');
          Swal.fire({
          icon: 'danger',
          title: 'Deleted!',
          text: `The template has been deleted.!`,
          confirmButtonText: "OK"
        }).then(async (result) => {
          if (result.isConfirmed) {
            await fetchInstructions();
            loadPage("drug_category/view_drug_category");
          }
        });
        })
        .catch((error) => {
          console.error(error);
          Swal.fire('Error!', 'Failed to delete the category.', 'error');
        })
        .finally(() => {
          hideLoader();
        });
    }
  });
});
