
console.log("Add Template Page Loaded");
function initAddDrugCategoryPage() {


  // ✅ Helper to enable/disable submit button
function toggleSubmitButton() {
  
  const submitBtn = document.getElementById("add-drug-category-btn");
  if (!submitBtn) return; // ✅ guard clause

  const invalidInputs = document.querySelectorAll("input[name='description'].is-invalid");

  if (invalidInputs.length > 0) {
    submitBtn.disabled = true;
  } else {
    submitBtn.disabled = false;
  }
}

// Attach event listener to the form (event delegation)
  document.getElementById("add-drug-category-form").addEventListener("blur", async function (e) {
  if (e.target && e.target.name === "description") {
    const input = e.target;
    const description = input.value.trim().toUpperCase();

    if (description) {
      // 1️⃣ Check local duplicates (within the form)
      const allInputs = [...document.querySelectorAll("input[name='description']")];
      const duplicateInForm = allInputs.filter(el => el.value.trim().toUpperCase() === description);

      if (duplicateInForm.length > 1) {
        input.classList.add("is-invalid");
        Swal.fire({
          icon: "warning",
          title: "⛔ Duplicate in form",
          text: `"${description}" is already entered in another row.`,
        });
      } else {
        input.classList.remove("is-invalid");
      }

      // 2️⃣ Check DB duplicate (only if still valid locally)
      if (!input.classList.contains("is-invalid")) {
        showLoader();
        const isUnique = await checkDuplicateDrugCategory(description);
        hideLoader();

        if (!isUnique) {
          hideLoader();
          input.classList.add("is-invalid");
          Swal.fire({
            icon: "warning",
            title: "⛔ Already exists in database", 
            text: `"${description}" is already saved.`,
          });
        } else {
          input.classList.remove("is-invalid");
        }
      }
    }

    // 🔥 After every check, toggle submit button properly
    toggleSubmitButton();
  }
}, true);


  addRowBtnFunction();
  addCategoryFunction();
}

// -----------Check Duplicate Drug Name -----------
async function checkDuplicateDrugCategory(description) {
  console.log("Checking for duplicate drug description...");

  try {
    const token = localStorage.getItem("token");
    const url = `/api/v1/drug_names/check_duplicate_drug_name?drug_name=${encodeURIComponent(drugName)}`;
    
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
        title: '⛔ Error checking duplicate drug name',
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

function addRowBtnFunction() {
  const addBtn = document.getElementById('addRowBtn');
  const container = document.getElementById('drug-category-rows');

  if (!addBtn || !container) return;

  // Prevent duplicate add event
  if (!addBtn.dataset.bound) {
    addBtn.addEventListener('click', function () {
      const row = document.createElement('div');
      row.className = 'row gy-4 gx-3 align-items-end mt-2';

      row.innerHTML = `
        <div class="col-md-12 d-flex align-items-end">
          <div class="w-100">
            <label class="form-label">Template*</label>
            <input type="text" class="form-control" name="description" id="description" placeholder="Enter Description" style="text-transform: uppercase;" required>
          </div>
          <button type="button" class="btn btn-outline-danger ms-2 removeRowBtn" title="Remove this row">
            <i class="bi bi-x-circle"></i>
          </button>
        </div>
      `;

      container.appendChild(row);
    });
    addBtn.dataset.bound = "true";
  }

  // Remove row dynamically
  if (!container.dataset.bound) {
    container.addEventListener('click', function (e) {
      if (e.target.closest('.removeRowBtn')) {
        const row = e.target.closest('.row');
        if (row) row.remove();
      }
    });
    container.dataset.bound = "true";
  }
}

function addCategoryFunction() {
  const form = document.getElementById('add-drug-category-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const descriptions = [];

    form.querySelectorAll(".row").forEach(row => {
      const description = row.querySelector("input[name='description']").value.trim().toUpperCase();
     
      if (description) {
        descriptions.push(description);
      }
    });
    if (descriptions.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter all the template.',
      });
      return;
    }

    showLoader();
    const token = localStorage.getItem("token");
    fetch('/api/v1/drug_category/add_drug_category', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({descriptions})
    })
    .then(response => response.json())
    .then(data => {
      hideLoader();
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Template added successfully!`,
          confirmButtonText: "OK"
        }).then((result) => {
      if (result.isConfirmed) {
        // ✅ Update localStorage instead of clearing it
            let localStorageInstructionList = JSON.parse(localStorage.getItem("instruction_list")) || [];

            // ✅ Append only new descriptions that aren't already in the list
            descriptions.forEach(desc => {
              if (!localStorageInstructionList.includes(desc)) {
                localStorageInstructionList.push(desc);
              }
            });

            localStorage.setItem("instruction_list", JSON.stringify(localStorageInstructionList));
        // ✅ Redirect or refresh page after update
        loadPage("drug_category/view_drug_category");
      }
    });        
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to add template.'
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'An unexpected error occurred.'
      });
    })
    .finally(() => {
      hideLoader();
    })
  });
}



// initAddDrugCategoryPage();

