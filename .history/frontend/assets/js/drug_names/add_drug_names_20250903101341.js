console.log("Add Drug Names Page Loaded");
function initAddDrugsPage(){
  console.log("initAddDrugsPage");

// checking duplicate name and phone number while typing
  document.getElementById("drugName").addEventListener("input", async function () {
    const fullName = this.value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    if (fullName && phoneNumber.length === 10) {  
      showLoader();
      const isDuplicate = await checkkDuplicatePatient(fullName, phoneNumber);
      if (!isDuplicate) {
        hideLoader();
        Swal.fire({
          icon: 'warning',
          title: '⛔ Duplicate patient found',
          text: 'A patient with the same name and phone number already exists.',
        });
      }
    }
  });


  addRowBtnFunction();
  // loadDrugCategories();
  addDrugNamesFunction();
  // let drugCategories = []; // stores fetched categories
}


// Function to handle initial category fetch
// function loadDrugCategories() {
//   const token = localStorage.getItem("token");
//   showLoader();
//   fetch('/api/v1/drug_category/view_drug_category', {
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`
//     }
//   })
//   .then(res => res.json())
//   .then(data => {
//     if (data.success && Array.isArray(data.data)) {
//       drugCategories = data.data; // save globally

//       const dropdown = document.getElementById('drugCategory');
//       populateDropdown(dropdown, drugCategories);
//     } else {
//       console.warn("Failed to load drug categories:", data.message);
//     }
//   })
//   .catch(err => {
//     console.error("Error loading categories:", err);
//   }).finally(() => {
//     hideLoader();
//   });
// }

// Helper Function to populate dropdown
// function populateDropdown(selectElement, categories) {
//   selectElement.innerHTML = `<option value="">-- Select Category --</option>`;
//   categories.forEach(category => {
//     const option = document.createElement('option');
//     option.value = category.DrugCategoryId;
//     option.textContent = category.DrugCategoryName;
//     selectElement.appendChild(option);
//   });
// }

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
        <input type="text" class="form-control" name="drugName" placeholder="Enter Drug Name" required style="text-transform: uppercase;">
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

// Function to handle form submission
function addDrugNamesFunction() {
  console.log("addDrugNamesFunction");
  const form = document.getElementById("add-drug-name-form");
  form.addEventListener("submit", function (e) {
    console.log("Form submitted");
    e.preventDefault();
    const formData = new FormData(form);
    const drugNames = [];
    // const drugCategoryIds = [];
    // const drugCategoryNames = [];
    form.querySelectorAll(".row").forEach(row => {
      const drugName = row.querySelector("input[name='drugName']").value.trim().toUpperCase();
      // const drugCategoryId = row.querySelector("select[name='drugCategory']").value;
      // const drugCategoryName = row.querySelector("select[name='drugCategory'] option:checked").textContent.trim();

      if (drugName) {
        drugNames.push(drugName);
        // drugCategoryIds.push(drugCategoryId);
        // drugCategoryNames.push(drugCategoryName);
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
        // Clear local cache so new data is fetched
        // localStorage.removeItem("drug_list");
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
    // }).finally(() => {
    //   hideLoader();
    // }
    });
  });
}