
console.log("Add Drug Category Page Loaded");
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
        <div class="col-md-6 d-flex align-items-end">
          <div class="w-100">
            <label class="form-label">Template*</label>
            <input type="text" class="form-control" name="description[]" id="description" placeholder="Enter Description" required>
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
    const drugCategoryName = formData.get("drugCategoryName");              // string
    const description = formData.getAll("description[]").filter(Boolean);  // array of non-empty strings

    if (!drugCategoryName || description.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter all the template.',
      });
      return;
    }

    const requestData = {
      drugCategoryName,
      description
    };

    console.log("Request Data:", requestData);

    showLoader();
    const token = localStorage.getItem("token");
    fetch('/api/v1/drug_category/add_drug_category', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `${drugCategoryName} category added successfully!`,
        });
        loadPage("drug_category/view_drug_category");
        // form.reset();
        // Optionally clear dynamically added rows
        // document.querySelectorAll("#drug-category-rows .row.mt-2").forEach(row => row.remove());
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to add drug category.'
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

