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

    // Previous
    const prevItem = document.createElement("li");
    prevItem.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
    prevItem.innerHTML = `<a class="page-link" href="#">Previous</a>`;
    prevItem.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage > 1) fetchPatients(false, currentPage - 1);
    });
    paginationContainer.appendChild(prevItem);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageItem = document.createElement("li");
      pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
      pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      pageItem.addEventListener("click", (e) => {
        e.preventDefault();
        fetchPatients(false, i);
      });
      paginationContainer.appendChild(pageItem);
    }

    // Next
    const nextItem = document.createElement("li");
    nextItem.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
    nextItem.innerHTML = `<a class="page-link" href="#">Next</a>`;
    nextItem.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage < totalPages) fetchPatients(false, currentPage + 1);
    });
    paginationContainer.appendChild(nextItem);
  }

  // 🔁 PAGINATION STATE
  let paginationMap = new Map(); // pageNumber => cursor
  let currentPage = 1;
  let totalPages = 1;
  let pageSize = 10;

  async function fetchPatients(isInitial = false, pageNumber = 1) {
    const searchType = document.getElementById("search_type").value;
    const searchValue = document.getElementById("search_value").value.trim().toUpperCase();
    const patientsTableBody = document.getElementById("patient-table-body");

    if (isInitial) {
      paginationMap.clear(); // 🔄 Reset all pagination
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

      const response = await fetch(`/api/v1/patients/view_and_search_patients?${queryParams}`, {
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
      const patients = result.data?.data || [];
      const nextCursor = result.data?.next_cursor || null;
      const totalCount = result.data?.total_count || 0;

      // Total Patient Count
      const patientCountElement = document.getElementById("patient-count");
      patientCountElement.textContent = totalCount;

      totalPages = Math.ceil(totalCount / pageSize);
      currentPage = pageNumber;

      // Store next cursor for next page
      if (nextCursor) {
        paginationMap.set(pageNumber + 1, nextCursor);
      }

      // Render table
      patientsTableBody.innerHTML = "";
      if (patients.length === 0) {
        patientsTableBody.innerHTML = "<tr><td colspan='6' class='text-center'>No patients found.</td></tr>";
        return;
      }

      patients.forEach((patient, index) => {
        const row = document.createElement("tr");
        const serialNumber = (currentPage - 1) * pageSize + index + 1;
        row.innerHTML = `
          <td>${serialNumber}</td>
          <td>${patient.PatientRegistrationNumber || "N/A"}</td>
          <td>${patient.FullName || "N/A"}</td>
          <td>${patient.PhoneNumber || "N/A"}</td>
          <td>${patient.PatientType || "N/A"}</td>
          <td>
            <button class="btn btn-sm btn-outline-secondary me-1" title="Edit Patient" onclick="loadPage('patients/edit_patients', {patient_id: '${patient.PatientRegistrationNumber}'})"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-warning me-1" title="View History" onclick="loadPage('appointments/view_appointment_history', {reg_no: '${patient.PatientRegistrationNumber}'})"><i class="bi bi-clock-history"></i></button>
            <button class="btn btn-sm btn-outline-primary me-1" title="Book Appointment" onclick="loadPage('appointments/add_appointments', {patient_id: '${patient.PatientRegistrationNumber}', patient_name: '${patient.FullName}', patient_phone: '${patient.PhoneNumber}'})"><i class="bi bi-calendar-plus"></i></button>
          </td>
        `;
        patientsTableBody.appendChild(row);
      });

      renderPagination(currentPage, totalPages);

    } catch (error) {
      console.error("Error fetching patients:", error);
      patientsTableBody.innerHTML = "<tr><td colspan='6' class='text-center text-danger'>Error loading patients.</td></tr>";
    } finally {
      hideLoader();
    }
  }

  async function viewPatients() {
    const searchValueInput = document.getElementById("search_value");
    const searchTypeInput = document.getElementById("search_type");

    const handleSearch = debounce(() => {
      const value = searchValueInput.value.trim();
      const type = searchTypeInput.value;

      if (value === "") {
        fetchPatients(true, 1);
      } else if (type && value.length > 2) {
        fetchPatients(true, 1);
      }
    }, 400);

    searchValueInput.addEventListener("input", handleSearch);

    // First load
    await fetchPatients(true, 1);
  }

  window.initViewPatientsPage = viewPatients;
})();

// ===================XXXXXXXXXXXXXXXXX========================
// (function(){
//     function debounce(func, delay) {
//       let timer;
//       return function (...args) {
//         clearTimeout(timer);
//         timer = setTimeout(() => func.apply(this, args), delay);
//       };
//     }


// function renderPagination(currentPage, totalPages) {
//   const paginationContainer = document.getElementById("pagination-container");
//   paginationContainer.innerHTML = "";

//   // Previous
//   const prevItem = document.createElement("li");
//   prevItem.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
//   prevItem.innerHTML = `<a class="page-link" href="#">Previous</a>`;
//   prevItem.addEventListener("click", (e) => {
//     e.preventDefault();
//     if (currentPage > 1) fetchPatients(currentPage - 1);
//   });
//   paginationContainer.appendChild(prevItem);

//   // Page numbers
//   for (let i = 1; i <= totalPages; i++) {
//     const pageItem = document.createElement("li");
//     pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
//     pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
//     pageItem.addEventListener("click", (e) => {
//       e.preventDefault();
//       fetchPatients(i);
//     });
//     paginationContainer.appendChild(pageItem);
//   }

//   // Next
//   const nextItem = document.createElement("li");
//   nextItem.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
//   nextItem.innerHTML = `<a class="page-link" href="#">Next</a>`;
//   nextItem.addEventListener("click", (e) => {
//     e.preventDefault();
//     if (currentPage < totalPages) fetchPatients(currentPage + 1);
//   });
//   paginationContainer.appendChild(nextItem);
// }


// let paginationMap = new Map(); // pageNumber -> cursor
// let currentPage = 1;
// let totalPages = 1;
// let pageSize = 10;

// let nextCursor = null; // Initialize cursor for pagination

// async function fetchPatients(isInitial = false, pageNumber = 1) {
//   console.log("Fetching patients...");

//   const searchType = document.getElementById("search_type").value;
//   const searchValue = document.getElementById("search_value").value.trim().toUpperCase();
//   const patientsTableBody = document.getElementById("patient-table-body");

//   // if (isInitial) {
//   //   nextCursor = null;
//   //   patientsTableBody.innerHTML = "";
//   // }
//   showLoader(); // Show loader before fetching data
//   try {
//     const token = localStorage.getItem("token");

//     const queryParams = new URLSearchParams({
//       search_type: searchType || "",
//       search_value: searchValue || "",
//       cursor: nextCursor || "",
//       limit: pageSize,
//     });

//     const response = await fetch(`/api/v1/patients/view_and_search_patients?${queryParams}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });
    
//     if (response.status === 401) {
//         Swal.fire({
//           icon: 'warning',
//           title: 'Session Expired',
//           text: 'Your session has expired. Please sign in again.',
//         }).then(() => {
//           localStorage.removeItem("token");
//           window.location.href = "/"; // or your login page
//         });
//         return; // stop further processing
//       }

//     const result = await response.json();

//     const patients = result.data?.data || [];

//     // ------new----------
//      // Store next page cursor
//     if (patients.next_cursor) {
//       paginationMap.set(pageNumber + 1, patients.next_cursor);
//     }

//     // Update global tracking
//     currentPage = pageNumber;
//     totalPages = Math.ceil((patients.total_count || 0) / pageSize);

//     patientsTableBody.innerHTML = ""; // Clear old rows
//   // ---------------------


//     // nextCursor = result.data?.next_cursor || null;

//     if (patients.length === 0 && isInitial) {
//       patientsTableBody.innerHTML = "<tr><td colspan='6' class='text-center'>No patients found.</td></tr>";
//       document.getElementById("load-more-btn").classList.add("d-none");
//       return;
//     }

//     patients.forEach((patient, index) => {
//       const row = document.createElement("tr");
//       row.innerHTML = `
//         <td>${index + 1}</td>
//         <td>${patient.PatientRegistrationNumber || "N/A"}</td>
//         <td>${patient.FullName || "N/A"}</td>
//         <td>${patient.PhoneNumber || "N/A"}</td>
//         <td>${patient.PatientType || "N/A"}</td>
//         <td>     
//           <button class="btn btn-sm btn-outline-secondary me-1" title="Edit Patient" onclick="loadPage('patients/edit_patients', {patient_id: '${patient.PatientRegistrationNumber}'})"><i class="bi bi-pencil"></i></button>
//           <button class="btn btn-sm btn-outline-warning me-1" title="View History" onclick="loadPage('appointments/view_appointment_history', {reg_no: '${patient.PatientRegistrationNumber}'})"><i class="bi bi-clock-history"></i></button>
//           <button class="btn btn-sm btn-outline-primary me-1" onclick = "loadPage('appointments/add_appointments', {patient_id: '${patient.PatientRegistrationNumber}', patient_name: '${patient.FullName}', patient_phone: '${patient.PhoneNumber}'})" title="Book Appointment"><i class="bi bi-calendar-plus"></i></button>
//         </td>
//       `;
//       patientsTableBody.appendChild(row);
//     });

//     renderPagination(currentPage, totalPages);

//     // const loadMoreBtn = document.getElementById("load-more-btn");
//     // if (nextCursor && !searchValue) {
//     //   loadMoreBtn.classList.remove("d-none");
//     // } else {
//     //   loadMoreBtn.classList.add("d-none");
//     // }

//   } catch (error) {
//     console.error("Error fetching patients:", error);
//     patientsTableBody.innerHTML = "<tr><td colspan='6' class='text-center text-danger'>Error loading patients.</td></tr>";
//   } finally {
//     hideLoader(); // Hide loader after fetching data
//   }
// }

// // Load More Button
// // document.getElementById("load-more-btn").addEventListener("click", () => {
// //   fetchPatients(false);
// // });




//   // -------------------------- View Patients -------------------------
//   async function viewPatients() {
//     console.log("Initializing View Patients...");

//     const searchValueInput = document.getElementById("search_value");
//     const searchTypeInput = document.getElementById("search_type");

//       const handleSearch = debounce(() => {
//           const value = searchValueInput.value.trim();
//           const type = searchTypeInput.value;

//           if (value === "") {
//               console.log("Cleared input – fetching all patients");
//               fetchPatients(true);
//           } else if (type && value.length > 2) {
//               console.log(`Searching by "${type}": ${value}`);
//               fetchPatients(true);
//           }
//       }, 400); // 400ms delay — you can adjust

//       searchValueInput.addEventListener("input", handleSearch);

//     // Initial data load
//     await fetchPatients(true);
//   }

//   window.initViewPatientsPage = viewPatients; // Export only this if needed

//   })();

