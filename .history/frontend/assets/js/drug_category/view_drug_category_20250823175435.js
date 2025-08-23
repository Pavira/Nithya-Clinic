function initViewDrugCategoryPage(){
    viewDrugCategoryFunction();
}

// Function to delete a drug category
function deleteDrugCategory(categoryId) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This action will delete the drug category permanently!',
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
            throw new Error('Failed to delete category');
          }
          return response.json();
        })
        .then((data) => {
          Swal.fire('Deleted!', 'The drug category has been deleted.', 'success');
          localStorage.removeItem("instruction_list");
          // ✅ Optionally reload list or page
          setTimeout(() => {
            loadPage('drug_category/view_drug_category');
          }, 1000);
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
}


function viewDrugCategoryFunction() {
    const viewDrugCategoryTable = document.getElementById("viewDrugCategoryTable");
    if (!viewDrugCategoryTable) {
        console.error("viewDrugCategoryTable not found in the DOM.");
        return;
    }

    const viewDrugCategoryTableBody = viewDrugCategoryTable.querySelector("tbody");
    if (!viewDrugCategoryTableBody) {
        console.error("Table body (tbody) not found in viewDrugCategoryTable.");
        return;
    }

    // Clear existing rows
    viewDrugCategoryTableBody.innerHTML = "";

    showLoader();
    // Fetch drug categories from the API
    fetch("/api/v1/drug_category/view_drug_category")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                
                // Total categories count
                let total_categories_count = 0;
                total_categories_count = data.data.length;
                document.getElementById("drug-category-count").textContent = total_categories_count;

                data.data.forEach((category, index) => {
                    const row = document.createElement("tr");

                    // Check if description is an array
                    // let descriptionText = "";
                    // if (Array.isArray(category.Description) && category.Description.length > 0) {
                    //     descriptionText = `${category.Description[0]}...`;
                    // } else if (typeof category.Description === "string") {
                    //     descriptionText = category.Description;
                    // }

                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${category.Description}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-secondary me-1" title="Edit Drug Category" onclick="loadPage('drug_category/edit_drug_category', {category_id: '${category.DrugCategoryId}', description: '${category.Description}'})"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-outline-danger" title="Delete Drug Category" onclick="deleteDrugCategory('${category.DrugCategoryId}')"><i class="bi bi-trash"></i></button>
                        </td>
                    `;
                    viewDrugCategoryTableBody.appendChild(row);
                });
            }else if (data.data && data.data.length === 0) {
                viewDrugCategoryTableBody.innerHTML = "<tr><td colspan='3' class='text-center'>No Templates found.</td></tr>";
            }
            else {
                console.error("Error fetching Templates:", data.message);
            }
        })
        .catch(error => console.error("Error:", error))
        .finally(() => hideLoader());
}
