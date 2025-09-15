
console.log("Add Template Page Loaded");
function initAddDrugCategoryPage() {

  addRowBtnFunction();
  addCategoryFunction();
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

