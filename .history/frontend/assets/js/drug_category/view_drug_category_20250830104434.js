(function () {
  function debounce(func, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  function renderPagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById("pagination-container");
    paginationContainer.innerHTML = "";

    function createPageItem(label, page, isActive = false, isDisabled = false) {
      const li = document.createElement("li");
      li.className = `page-item ${isActive ? "active" : ""} ${isDisabled ? "disabled" : ""}`;
      li.innerHTML = `<a class="page-link" href="#">${label}</a>`;
      if (!isDisabled && !isActive) {
        li.addEventListener("click", (e) => {
          e.preventDefault();
          fetchDrugCategories(false, page);
        });
      }
      return li;
    }
    // Previous
    paginationContainer.appendChild(createPageItem("Previous", currentPage - 1, false, currentPage === 1));

    const maxVisiblePages = 3;
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        paginationContainer.appendChild(createPageItem(i, i, i === currentPage));
      }
    } else {
      paginationContainer.appendChild(createPageItem(1, 1, currentPage === 1));

      if (currentPage > maxVisiblePages + 2) {
        const dots = document.createElement("li");
        dots.className = "page-item disabled";
        dots.innerHTML = `<span class="page-link">...</span>`;
        paginationContainer.appendChild(dots);
      }

      const start = Math.max(2, currentPage - maxVisiblePages);
      const end = Math.min(totalPages - 1, currentPage + maxVisiblePages);
      for (let i = start; i <= end; i++) {
        paginationContainer.appendChild(createPageItem(i, i, i === currentPage));
      }

      if (currentPage < totalPages - maxVisiblePages - 1) {
        const dots = document.createElement("li");
        dots.className = "page-item disabled";
        dots.innerHTML = `<span class="page-link">...</span>`;
        paginationContainer.appendChild(dots);
      }

      paginationContainer.appendChild(createPageItem(totalPages, totalPages, currentPage === totalPages));
    }

    // Next
    paginationContainer.appendChild(createPageItem("Next", currentPage + 1, false, currentPage === totalPages));
  }

  // 🔁 PAGINATION STATE
  let paginationMap = new Map();
  let currentPage = 1;
  let totalPages = 1;
  let pageSize = 10;

  async function fetchDrugCategories(isInitial = false, pageNumber = 1) {
    const searchType = document.getElementById("search_type").value;
    const searchValue = document.getElementById("search_value").value.trim();
    const tableBody = document.getElementById("drug-category-table-body");

    if (isInitial) {
      paginationMap.clear();
      pageNumber = 1;
    }

    const token = localStorage.getItem("token");
    let cursor = paginationMap.get(pageNumber) || "";

    showLoader();
    try {
      const queryParams = new URLSearchParams({
        search_type: searchType || "",
        search_value: searchValue || "",
        cursor,
        limit: pageSize,
      });

      const response = await fetch(`/api/v1/drug_category/view_drug_category?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      const categories = result.data || [];
      const nextCursor = result.next_cursor || null;
      const totalCount = result.total_count || 0;

      document.getElementById("drug-category-count").textContent = totalCount;

      totalPages = Math.ceil(totalCount / pageSize);
      currentPage = pageNumber;

      if (nextCursor) {
        paginationMap.set(pageNumber + 1, nextCursor);
      }

      tableBody.innerHTML = "";
      if (categories.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='3' class='text-center'>No Templates found.</td></tr>";
        return;
      }

      categories.forEach((category, index) => {
        const row = document.createElement("tr");
        const serialNumber = (currentPage - 1) * pageSize + index + 1;
        row.innerHTML = `
          <td>${serialNumber}</td>
          <td>${category.Description || "N/A"}</td>
          <td>
            <button class="btn btn-sm btn-outline-secondary me-1" title="Edit Category" 
              onclick="loadPage('drug_category/edit_drug_category', {category_id: '${category.DrugCategoryId}', description: '${category.Description}'})">
              <i class="bi bi-pencil"></i>
            </button>
            
          </td>
        `;
        tableBody.appendChild(row);
      });

      renderPagination(currentPage, totalPages);

    } catch (error) {
      console.error("Error fetching categories:", error);
      tableBody.innerHTML = "<tr><td colspan='3' class='text-center text-danger'>Error loading categories.</td></tr>";
    } finally {
      hideLoader();
    }
  }
  async function viewDrugCategoryFunction() {
    const searchInput = document.getElementById("search_value");
    

    const handleSearch = debounce(() => {
      const value = searchInput.value.trim();

      if (value === "") {
        fetchDrugCategories(true, 1);
      } else if (value.length > 2) {
        fetchDrugCategories(true, 1);
      }
    }, 400);

    searchInput.addEventListener("input", handleSearch);

    // First load
    await fetchDrugCategories(true, 1);
  }

  window.initViewDrugCategoryPage = viewDrugCategoryFunction;
})();


// ========================================================////////////=================
// function initViewDrugCategoryPage(){
//     viewDrugCategoryFunction();
// }

// // Function to delete a drug category
// function deleteDrugCategory(categoryId) {
//   Swal.fire({
//     title: 'Are you sure?',
//     text: 'This action will delete the drug category permanently!',
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonColor: '#d33',
//     cancelButtonColor: '#6c757d',
//     confirmButtonText: 'Yes, delete it!',
//   }).then((result) => {
//     if (result.isConfirmed) {
//       showLoader();
//       const token = localStorage.getItem("token");
//       fetch(`/api/v1/drug_category/delete/${categoryId}`, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//       })
//         .then((response) => {
//           if (!response.ok) {
//             throw new Error('Failed to delete category');
//           }
//           return response.json();
//         })
//         .then((data) => {
//           Swal.fire('Deleted!', 'The drug category has been deleted.', 'success');
//           fetchInstructions();
//           // ✅ Optionally reload list or page
//           setTimeout(() => {
//             loadPage('drug_category/view_drug_category');
//           }, 1000);
//         })
//         .catch((error) => {
//           console.error(error);
//           Swal.fire('Error!', 'Failed to delete the category.', 'error');
//         })
//         .finally(() => {
//           hideLoader();
//         });
//     }
//   });
// }


// function viewDrugCategoryFunction() {
//     const viewDrugCategoryTable = document.getElementById("viewDrugCategoryTable");
//     if (!viewDrugCategoryTable) {
//         console.error("viewDrugCategoryTable not found in the DOM.");
//         return;
//     }

//     const viewDrugCategoryTableBody = viewDrugCategoryTable.querySelector("tbody");
//     if (!viewDrugCategoryTableBody) {
//         console.error("Table body (tbody) not found in viewDrugCategoryTable.");
//         return;
//     }

//     // Clear existing rows
//     viewDrugCategoryTableBody.innerHTML = "";

//     showLoader();
//     // Fetch drug categories from the API
//     fetch("/api/v1/drug_category/view_drug_category")
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
                
//                 // Total categories count
//                 let total_categories_count = 0;
//                 total_categories_count = data.data.length;
//                 document.getElementById("drug-category-count").textContent = total_categories_count;

//                 data.data.forEach((category, index) => {
//                     const row = document.createElement("tr");

//                     // Check if description is an array
//                     // let descriptionText = "";
//                     // if (Array.isArray(category.Description) && category.Description.length > 0) {
//                     //     descriptionText = `${category.Description[0]}...`;
//                     // } else if (typeof category.Description === "string") {
//                     //     descriptionText = category.Description;
//                     // }

//                     row.innerHTML = `
//                         <td>${index + 1}</td>
//                         <td>${category.Description}</td>
//                         <td>
//                             <button class="btn btn-sm btn-outline-secondary me-1" title="Edit Drug Category" onclick="loadPage('drug_category/edit_drug_category', {category_id: '${category.DrugCategoryId}', description: '${category.Description}'})"><i class="bi bi-pencil"></i></button>
//                             <button class="btn btn-sm btn-outline-danger" title="Delete Drug Category" onclick="deleteDrugCategory('${category.DrugCategoryId}')"><i class="bi bi-trash"></i></button>
//                         </td>
//                     `;
//                     viewDrugCategoryTableBody.appendChild(row);
//                 });
//             }else if (data.data && data.data.length === 0) {
//                 viewDrugCategoryTableBody.innerHTML = "<tr><td colspan='3' class='text-center'>No Templates found.</td></tr>";
//             }
//             else {
//                 console.error("Error fetching Templates:", data.message);
//             }
//         })
//         .catch(error => console.error("Error:", error))
//         .finally(() => hideLoader());
// }
