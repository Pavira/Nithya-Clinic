function initEditDrugCategoryPage(){
    showCategoryDetails();
    editCategoryFunction();
}


  function showCategoryDetails() {
    // const category_name = window.pageParams?.category_name;
    const description = window.pageParams?.description;    
    document.getElementById('description').value = description || '';
  }

//   Edit drug category function
function editCategoryFunction() {
  const form = document.getElementById('edit-drug-category-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    // const drugCategoryName = formData.get("drugCategoryName");              // string
    const description = formData.get("description").trim().toUpperCase();              // string

    if (!window.pageParams?.category_id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Category ID is missing. Cannot edit category.'
      });
      return;
    }

    console.log("Category Id:", window.pageParams?.category_id);

    if (description.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter description.',
      });
      return;
    }

    const requestData = {
      drugCategoryId: window.pageParams?.category_id, // Assuming the ID is passed in pageParams
      // drugCategoryName,
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
      hideLoader();
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Template updated successfully!`,
          confirmButtonText: "OK"
        }).then(async (result) => {
          if (result.isConfirmed) {
            await fetchInstructions();
            loadPage("drug_category/view_drug_category");
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to update template.'
        });
      }
    })
    .catch(error => {
      hideLoader();
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
