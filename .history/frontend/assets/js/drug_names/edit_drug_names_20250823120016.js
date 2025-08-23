function initEditDrugsPage(){
  console.log("Drug Id:",window.pageParams?.drug_name_id);
    showDrugNameDetails();
    editDrugNameFunction();
}

  // Populate category details (from encoded data)
  function showDrugNameDetails() {
    const drug_name = window.pageParams?.drug_name;
    
    // const drug_category_name = window.pageParams?.drug_category_name;

    // Set the category name
    // document.getElementById('drugCategory').value = drug_category_name || '';
    document.getElementById('drugName').value = drug_name || '';
  }

//   Edit drug category function
function editDrugNameFunction() {
  const form = document.getElementById('edit-drug-name-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const drugName = formData.get('drugName');
    // const drugCategoryName = formData.get("drugCategory");              // string

    if (!window.pageParams?.drug_name_id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Drug ID is missing. Cannot edit Drug Name.'
      });
      return;
    }

    console.log("Drug Id:", window.pageParams?.drug_name_id);

    if (!drugName) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter drug name',
      });
      return;
    }

    const requestData = {
      drugNameId: window.pageParams?.drug_name_id, // Assuming the ID is passed in pageParams
      drugName
    };

    console.log("Request Data:", requestData);

    showLoader();
    const token = localStorage.getItem("token");
    fetch('/api/v1/drug_names/edit_drug_names', {
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
          text: `${drugName} has been updated successfully!`,
          confirmButtonText: "OK"
        }).then((result) => {
          if (result.isConfirmed) {
            // Clear local cache so new data is fetched
            localStorage.removeItem("drug_list");

            // Load the page after confirmation
            loadPage("drug_names/view_drug_names");
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to update drug name.'
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
    // .finally(() => {
    //   hideLoader();
    // })
  });
}

// Function to delete a drug Name
// function deleteDrugName(drugNameId) {
document.getElementById('delete-drug-name-btn').addEventListener('click', function() {
  const drugNameId = window.pageParams?.drug_name_id; // Assuming the ID is passed in pageParams
  Swal.fire({
    title: 'Are you sure?',
    text: 'This action will delete the drug name permanently!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      showLoader();
      const token = localStorage.getItem("token");
      fetch(`/api/v1/drug_names/delete/${drugNameId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to delete Drug Name');
          }
          return response.json();
        })
        .then((data) => {
          Swal.fire('Deleted!', 'The Drug Name has been deleted.', 'success');
          // ✅ Optionally reload list or page
          setTimeout(() => {
            loadPage('drug_names/view_drug_names');
          }, 1000);
        })
        .catch((error) => {
          console.error(error);
          Swal.fire('Error!', 'Failed to delete the Name.', 'error');
        })
        .finally(() => {
          hideLoader();
        });
    }
  });
  });

// }
