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

  // Helper to create page item
  function createPageItem(label, page, isActive = false, isDisabled = false) {
    const li = document.createElement("li");
    li.className = `page-item ${isActive ? "active" : ""} ${isDisabled ? "disabled" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${label}</a>`;
    if (!isDisabled && !isActive) {
      li.addEventListener("click", (e) => {
        e.preventDefault();
        fetchDrugNames(false, page);
      });
    }
    return li;
  }

  // Previous
  paginationContainer.appendChild(createPageItem("Previous", currentPage - 1, false, currentPage === 1));

  const maxVisiblePages = 3; // Number of adjacent pages to show

  if (totalPages <= 7) {
    // Show all pages if not many
    for (let i = 1; i <= totalPages; i++) {
      paginationContainer.appendChild(createPageItem(i, i, i === currentPage));
    }
  } else {
    // Always show first page
    paginationContainer.appendChild(createPageItem(1, 1, currentPage === 1));

    // Show ellipsis if needed
    if (currentPage > maxVisiblePages + 2) {
      const dots = document.createElement("li");
      dots.className = "page-item disabled";
      dots.innerHTML = `<span class="page-link">...</span>`;
      paginationContainer.appendChild(dots);
    }

    // Calculate range of pages to show
    const start = Math.max(2, currentPage - maxVisiblePages);
    const end = Math.min(totalPages - 1, currentPage + maxVisiblePages);
    for (let i = start; i <= end; i++) {
      paginationContainer.appendChild(createPageItem(i, i, i === currentPage));
    }

    // Ellipsis before last
    if (currentPage < totalPages - maxVisiblePages - 1) {
      const dots = document.createElement("li");
      dots.className = "page-item disabled";
      dots.innerHTML = `<span class="page-link">...</span>`;
      paginationContainer.appendChild(dots);
    }

    // Last page
    paginationContainer.appendChild(createPageItem(totalPages, totalPages, currentPage === totalPages));
  }

  // Next
  paginationContainer.appendChild(createPageItem("Next", currentPage + 1, false, currentPage === totalPages));
}

  // 🔁 PAGINATION STATE
  let paginationMap = new Map(); // pageNumber => cursor
  // let currentPage = 1;
  // let totalPages = 1;
  // let pageSize = 10;

  async function fetchDrugNames(isInitial = false, pageNumber = 1) {
    console.log("Fetching Drug Names...");  
    const searchType = document.getElementById("search_type").value;
    const searchValue = document.getElementById("search_value").value.trim().toUpperCase();
    const drugsTableBody = document.getElementById("drug-names-table-body");

    if (isInitial) {
      paginationMap.clear(); // 🔄 Reset all pagination
      pageNumber = 1;
    }

    const isSearch = Boolean(searchType && searchValue);
    const queryParams = new URLSearchParams({
      search_type: searchType || "",
      search_value: searchValue || "",
    });

    // 📌 Only send cursor when NOT searching
    if (!isSearch) {
      const cursor = paginationMap.get(pageNumber) || "";
      if (cursor) queryParams.set("cursor", cursor);
    }

    const token = localStorage.getItem("token");
    // let cursor = paginationMap.get(pageNumber) || "";

    showLoader();
    try {
      // const queryParams = new URLSearchParams({
      //   search_type: searchType || "",
      //   search_value: searchValue || "",
      //   cursor,
      //   // limit: pageSize,
      // });

      const response = await fetch(`/api/v1/drug_names/view_and_search_drug_names?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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
          window.location.href = "/";
        });
        return;
      }

      const result = await response.json();
      const drugs = result.data || [];
      const nextCursor = result.next_cursor || null;
      const totalCount = result.total_count || 0;

      // Total Drug Name Count
      const drugCountElement = document.getElementById("drug-names-count");
      drugCountElement.textContent = totalCount;

       // 🔄 Pagination state
      if (isSearch) {
        totalPages = 1;
        currentPage = 1;
        paginationMap.clear();
      } else {
        const pageSize = 10;
        totalPages = Math.ceil(totalCount / pageSize);
        currentPage = pageNumber;
        if (nextCursor) paginationMap.set(pageNumber + 1, nextCursor);
      }

      // totalPages = Math.ceil(totalCount / pageSize);
      // currentPage = pageNumber;

      // // Store next cursor for next page
      // if (nextCursor) {
      //   paginationMap.set(pageNumber + 1, nextCursor);
      // }

      // Render table
      drugsTableBody.innerHTML = "";
      if (drugs.length === 0) {
        drugsTableBody.innerHTML = "<tr><td colspan='6' class='text-center'>No drugs found.</td></tr>";
        // renderPagination(currentPage, totalPages);
        return;
      }

      drugs.forEach((drug, index) => {
        const row = document.createElement("tr");
        const serialNumber = (currentPage - 1) * pageSize + index + 1;
        row.innerHTML = `
          <td>${serialNumber}</td>
          <td>${drug.DrugName || "N/A"}</td>          
          <td>
            <button class="btn btn-sm btn-outline-secondary me-1" title="Edit Drug" onclick="loadPage('drug_names/edit_drug_names', {drug_name_id: '${drug.DrugNameId}', drug_name: '${drug.DrugName}'})"><i class="bi bi-pencil"></i></button>          
          </td>
        `;
        drugsTableBody.appendChild(row);
      });

      renderPagination(currentPage, totalPages);

    } catch (error) {
      console.error("Error fetching drugs:", error);
      drugsTableBody.innerHTML = "<tr><td colspan='6' class='text-center text-danger'>Error loading drugs.</td></tr>";
    } finally {
      hideLoader();
    }
  }


  async function viewDrugNames() {
    console.log("View Drug Names Page Loaded");
    const searchValueInput = document.getElementById("search_value");
    const searchTypeInput = document.getElementById("search_type");

    const handleSearch = debounce(() => {
      const value = searchValueInput.value.trim();
      const type = searchTypeInput.value;

      if (value === "") {
        fetchDrugNames(true, 1);
      } else if (type && value.length > 3) {
        fetchDrugNames(true, 1);
      }
    }, 400);

    searchValueInput.addEventListener("input", handleSearch);

    // First load
    await fetchDrugNames(true, 1);
  }

  window.initViewDrugsPage = viewDrugNames;
})();