(function(){
    function debounce(func, delay) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
      };
    }


let nextCursor = null; // Initialize cursor for pagination

async function fetchPatients(isInitial = false) {
  console.log("Fetching patients...");

  const searchType = document.getElementById("search_type").value;
  const searchValue = document.getElementById("search_value").value.trim().toUpperCase();
  const patientsTableBody = document.getElementById("patient-table-body");

  if (isInitial) {
    nextCursor = null;
    patientsTableBody.innerHTML = "";
  }
  showLoader(); // Show loader before fetching data
  try {
    const token = localStorage.getItem("token");

    const queryParams = new URLSearchParams({
      search_type: searchType || "",
      search_value: searchValue || "",
      cursor: nextCursor || "",
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
          window.location.href = "/"; // or your login page
        });
        return; // stop further processing
      }

    const result = await response.json();

    const patients = result.data?.data || [];
    nextCursor = result.data?.next_cursor || null;

    if (patients.length === 0 && isInitial) {
      patientsTableBody.innerHTML = "<tr><td colspan='6' class='text-center'>No patients found.</td></tr>";
      document.getElementById("load-more-btn").classList.add("d-none");
      return;
    }

    patients.forEach((patient, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>#</td>
        <td>${patient.PatientRegistrationNumber || "N/A"}</td>
        <td>${patient.FullName || "N/A"}</td>
        <td>${patient.PhoneNumber || "N/A"}</td>
        <td>${patient.PatientType || "N/A"}</td>
        <td>     
          <button class="btn btn-sm btn-outline-secondary me-1" title="Edit Patient" onclick="loadPage('patients/edit_patients', {patient_id: '${patient.PatientRegistrationNumber}'})"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-warning me-1" title="View History"><i class="bi bi-clock-history"></i></button>
          <button class="btn btn-sm btn-outline-primary me-1" onclick = "loadPage('appointments/add_appointments', {patient_id: '${patient.PatientRegistrationNumber}', patient_name: '${patient.FullName}', patient_phone: '${patient.PhoneNumber}'})" title="Book Appointment"><i class="bi bi-calendar-plus"></i></button>
        </td>
      `;
      patientsTableBody.appendChild(row);
    });

    // <button class="btn btn-sm btn-outline-primary me-1" title="Edit Patient" onclick="loadPage('patients/edit_patients', { patient_id: '${PatientRegistrationNumber}' })"><i class="bi bi-pencil"></i></button>
    // Toggle "Load More" button
    const loadMoreBtn = document.getElementById("load-more-btn");
    if (nextCursor && !searchValue) {
      loadMoreBtn.classList.remove("d-none");
    } else {
      loadMoreBtn.classList.add("d-none");
    }

  } catch (error) {
    console.error("Error fetching patients:", error);
    patientsTableBody.innerHTML = "<tr><td colspan='6' class='text-center text-danger'>Error loading patients.</td></tr>";
  } finally {
    hideLoader(); // Hide loader after fetching data
  }
}

// Load More Button
document.getElementById("load-more-btn").addEventListener("click", () => {
  fetchPatients(false);
});


  // -------------------------- View Patients -------------------------
  async function viewPatients() {
    console.log("Initializing View Patients...");

    const searchValueInput = document.getElementById("search_value");
    const searchTypeInput = document.getElementById("search_type");

      const handleSearch = debounce(() => {
          const value = searchValueInput.value.trim();
          const type = searchTypeInput.value;

          if (value === "") {
              console.log("Cleared input – fetching all patients");
              fetchPatients(true);
          } else if (type && value.length > 2) {
              console.log(`Searching by "${type}": ${value}`);
              fetchPatients(true);
          }
      }, 400); // 400ms delay — you can adjust

      searchValueInput.addEventListener("input", handleSearch);

    // Initial data load
    await fetchPatients(true);
  }

  window.initViewPatientsPage = viewPatients; // Export only this if needed

  })();