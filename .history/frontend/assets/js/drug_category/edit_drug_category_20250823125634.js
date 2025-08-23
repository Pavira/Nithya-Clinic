function initEditDrugCategoryPage(){
    showCategoryDetails();
    editCategoryFunction();
}

document.getElementById('addRowBtn').addEventListener('click', function () {
  addDescriptionRow('');
});

// Utility to create a description row
  // function createDescriptionRow(value = '', index = 0) {
  //   const row = document.createElement('div');
  //   row.classList.add('row', 'gy-3', 'gx-3', 'align-items-end', 'description-row', 'mb-2');

  //   row.innerHTML = `
  //     <div class="col-md-6">
  //       <label class="form-label">${index === 0 ? 'Description*' : '&nbsp;'}</label>
  //       <input type="text" class="form-control" name="description[]" value="${value}" placeholder="Enter Description" required>
  //     </div>
  //     <div class="col-md-2">
  //       ${index === 0
  //         ? `<button type="button" class="btn btn-outline-primary" onclick="addDescriptionRow()" title="Add another row">
  //             <i class="bi bi-plus-circle"></i>
  //           </button>`
  //         : `<button type="button" class="btn btn-outline-danger" onclick="removeRow(this)" title="Remove this row">
  //             <i class="bi bi-x-circle"></i>
  //           </button>`}
  //     </div>
  //   `;
  //   return row;
  // }

  // Add new description row
  function addDescriptionRow(value = '') {
    const rowsContainer = document.getElementById('drug-category-rows');
    const index = rowsContainer.querySelectorAll('.description-row').length;
    const newRow = createDescriptionRow(value, index);
    rowsContainer.appendChild(newRow);
  }

  // Remove row
  function removeRow(btn) {
    btn.closest('.description-row').remove();
  }

  // Populate category details (from encoded data)
  function showCategoryDetails() {
    // const category_name = window.pageParams?.category_name;
    const description = window.pageParams?.description;    
    document.getElementById('description').value = description || '';


    // let category_description = [];
    // try {
    //   category_description = JSON.parse(decodeURIComponent(description_encoded || '[]'));
    // } catch (e) {
    //   console.error("❌ Failed to parse description:", e);
    // }

    // // Set the category name
    // document.getElementById('drugCategoryName').value = category_name || '';
    // console.log("Category id:", window.pageParams?.category_id);
    // console.log("Category Name:", category_name);
    // console.log("Category Description:", category_description);

    // const rowsContainer = document.getElementById('drug-category-rows');
    // rowsContainer.innerHTML = '';

    // // If empty, add one blank row
    // if (category_description.length === 0) {
    //   addDescriptionRow();
    // } else {
    //   category_description.forEach((desc, index) => {
    //     const row = createDescriptionRow(desc, index);
    //     rowsContainer.appendChild(row);
    //   });
    // }
  }

//   Edit drug category function
function editCategoryFunction() {
  const form = document.getElementById('edit-drug-category-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const drugCategoryName = formData.get("drugCategoryName");              // string
    const description = formData.getAll("description[]").filter(Boolean);  // array of non-empty strings

    if (!window.pageParams?.category_id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Category ID is missing. Cannot edit category.'
      });
      return;
    }

    console.log("Category Id:", window.pageParams?.category_id);

    if (!drugCategoryName || description.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter both drug category and at least one description.',
      });
      return;
    }

    const requestData = {
      drugCategoryId: window.pageParams?.category_id, // Assuming the ID is passed in pageParams
      drugCategoryName,
      description
    };

    console.log("Request Data:", requestData);

    showLoader();
    const token = localStorage.getItem("token");
    fetch('/api/v1/drug_category/edit_drug_category', {
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
          text: `${drugCategoryName} category updated successfully!`,
        });
        loadPage('drug_category/view_drug_category'); // Redirect to view page
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to update drug category.'
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
