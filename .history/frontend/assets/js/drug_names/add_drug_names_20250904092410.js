console.log("Add Drug Names Page Loaded");
function initAddDrugsPage(){
  console.log("initAddDrugsPage");

// // checking duplicate name and phone number while typing
//   document.getElementById("drugName").addEventListener("blur", async function () {
//     const drugName = this.value.trim();
//     if (drugName) {  
//       showLoader();
//       const isDuplicate = await checkDuplicateDrugName(drugName);
//       if (!isDuplicate) {
//         hideLoader();
//         Swal.fire({
//           icon: 'warning',
//           title: '⛔ Duplicate Drug Name found',
//           text: 'A Drug Name with the same name already exists.',
//         });
//       }
//     }
//   });

// ✅ Helper to enable/disable submit button
function toggleSubmitButton() {
  
  const submitBtn = document.getElementById("add-drug-name-btn");
  if (!submitBtn) return; // ✅ guard clause

  const invalidInputs = document.querySelectorAll("input[name='drugName'].is-invalid");

  if (invalidInputs.length > 0) {
    submitBtn.disabled = true;
  } else {
    submitBtn.disabled = false;
  }
}

// Attach event listener to the form (event delegation)
  document.getElementById("add-drug-name-form").addEventListener("blur", async function (e) {
  if (e.target && e.target.name === "drugName") {
    const input = e.target;
    const drugName = input.value.trim().toUpperCase();

    if (drugName) {
      // 1️⃣ Check local duplicates (within the form)
      const allInputs = [...document.querySelectorAll("input[name='drugName']")];
      const duplicateInForm = allInputs.filter(el => el.value.trim().toUpperCase() === drugName);

      if (duplicateInForm.length > 1) {
        input.classList.add("is-invalid");
        Swal.fire({
          icon: "warning",
          title: "⛔ Duplicate in form",
          text: `"${drugName}" is already entered in another row.`,
        });
      } else {
        input.classList.remove("is-invalid");
      }

      // 2️⃣ Check DB duplicate (only if still valid locally)
      if (!input.classList.contains("is-invalid")) {
        showLoader();
        const isUnique = await checkDuplicateDrugName(drugName);
        hideLoader();

        if (!isUnique) {
          input.classList.add("is-invalid");
          Swal.fire({
            icon: "warning",
            title: "⛔ Already exists in database",
            text: `"${drugName}" is already saved.`,
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
  addDrugNamesFunction();
}


// -----------Check Duplicate Drug Name -----------
async function checkDuplicateDrugName(drugName) {
  console.log("Checking for duplicate drug name...");

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

// Function to handle adding new rows
function addRowBtnFunction(){
  console.log("addRowBtnFunction");
  const form = document.getElementById("add-drug-name-form");
  const drugNameRows = form.querySelector(".row");
  const addRowBtn = document.getElementById("addRowBtn");

  addRowBtn.addEventListener("click", function () {
    console.log("addRowBtn clicked");
    const newRow = document.createElement("div");
    newRow.className = "row gy-4 gx-3 align-items-end mt-2";

    newRow.innerHTML = `
      <div class="col-md-6 d-flex align-items-end">
        <input type="text" class="form-control" name="drugName" id="drugName" placeholder="Enter Drug Name" required style="text-transform: uppercase;">
        <button type="button" class="btn btn-outline-danger ms-2 removeRowBtn" title="Remove row">
          <i class="bi bi-dash-circle"></i>
        </button>
      </div>
    `;

    // Insert before submit button
    drugNameRows.parentNode.insertBefore(newRow, form.querySelector(".d-flex.justify-content-center"));

    const selectElement = newRow.querySelector("select");
    // populateDropdown(selectElement, drugCategories);
  });

  // Remove row
  form.addEventListener("click", function (e) {
    if (e.target.closest(".removeRowBtn")) {
      e.target.closest(".row").remove();
    }
  });
}

// async function checkDuplicateDrugNameBulk(drugNames) {

// Function to handle form submission
async function addDrugNamesFunction() {
  console.log("addDrugNamesFunction");
  const form = document.getElementById("add-drug-name-form");

  form.addEventListener("submit", function (e) {
    console.log("Form submitted");
    e.preventDefault();
    const formData = new FormData(form);
    const drugNames = [];
    form.querySelectorAll(".row").forEach(row => {
      const drugName = row.querySelector("input[name='drugName']").value.trim().toUpperCase();

      if (drugName) {
        drugNames.push(drugName);
      }
    });
    if (drugNames.length === 0) {
      swal.fire({
        title: "No Drug Names",
        text: "Please add at least one drug name.",
        icon: "warning",
      });
      return;
    }

    console.log("Submitting drug names:", drugNames);

    const token = localStorage.getItem("token");
    showLoader();
    fetch('/api/v1/drug_names/add_drug_names', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ drugNames})
    })
    .then(res => res.json())
    .then(data => {
      hideLoader();
      if (data.success) {
    Swal.fire({
      title: "Success",
      text: "Drug names added successfully!",
      icon: "success",
      confirmButtonText: "OK"
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ Update localStorage instead of clearing it
            let localStorageDrugList = JSON.parse(localStorage.getItem("drug_list")) || [];

            // ✅ Append only new descriptions that aren't already in the list
            drugNames.forEach(desc => {
              if (!localStorageDrugList.includes(desc)) {
                localStorageDrugList.push(desc);
              }
            });

            localStorage.setItem("drug_list", JSON.stringify(localStorageDrugList));

        // Load the page after confirmation
        loadPage("drug_names/view_drug_names");
      }
    });
  } else {
        swal.fire({
          title: "Error",
          text: data.message || "Failed to add drug names.",
          icon: "error",
        });
      }
    })
    .catch(err => {
      hideLoader();
      console.error("Error adding drug names:", err);
      swal.fire({
        title: "Error",
        text: "An error occurred while adding drug names.",
        icon: "error",
      });
    });
  });
}