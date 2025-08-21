function initViewAppointmentsPage() {
  let currentStatus = "active";
  let currentDate = new Date().toISOString().split("T")[0]; // default to today
  let currentSearchType = "full_name";
  let currentSearchValue = "";

  const buttons = document.querySelectorAll(".tab-btn");
  const underline = document.querySelector(".tab-underline");
  const tableBody = document.querySelector("#appointments-table-body");

  // ----------------- Move underline animation ------------------- //
  function moveUnderline(button) {
    const { offsetLeft, offsetWidth } = button;
    underline.style.left = offsetLeft + "px";
    underline.style.width = offsetWidth + "px";
  }

  // ----------------- Debounce helper ------------------- //
  function debounce(func, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // ----------------- Format Date to Text ------------------- //
  function formatDateToText(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  }
  // ----------------- Format Date to Local ------------------- //
  function formatForDatetimeLocalInput(input, includeSeconds = false) {
    const date = new Date(input);

    const pad = (n) => n.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());

    if (includeSeconds) {
      return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    } else {
      return `${year}-${month}-${day}T${hour}:${minute}`;
    }
  }

  // ----------------- Fetch appointments from server ------------------- //
  async function fetchAppointment(status, date, searchType, searchValue) {
    showLoader();
    try {
      const token = localStorage.getItem("token");

      const queryParams = new URLSearchParams({
        status: status || "",
        date: date || "",
        search_type: searchType || "",
        search_value: searchValue || "",
      });

      const url = `/api/v1/appointments/view_appointments?${queryParams}`;

      const response = await fetch(url, {
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
      const appointments = result.data?.appointments || [];

      console.log(result.data.active_count);
      console.log(result.data.closed_count);
      console.log(result.data.cancelled_count);

      document.getElementById("active-badge").textContent = result.data.active_count;
      document.getElementById("closed-badge").textContent = result.data.closed_count;
      document.getElementById("cancelled-badge").textContent = result.data.cancelled_count;

      // Clear table
      tableBody.innerHTML = "";

      if (appointments.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No appointments found.</td></tr>`;
        return;
      }

      // Render appointments
      appointments.forEach((appointment, index) => {
        formated_datetime = formatDateToText(appointment.AppointmentDateTime);
        formate_log_datetime = formatDateToText(appointment.LogDateTime);
        format_datetime_local = formatForDatetimeLocalInput(appointment.AppointmentDateTime, true);
        console.log( "format_datetime_local"+ format_datetime_local);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${appointment.PatientRegistrationNumber || "N/A"}</td>
          <td>${appointment.FullName || "N/A"}</td>
          <td>${appointment.AppointmentCategory || "N/A"}</td>
          <td>${formated_datetime || "N/A"}</td>
          <td>
          <button class="btn btn-sm btn-outline-primary" onclick = "loadPage('appointments/edit_appointments', 
                {
                  patient_id: '${appointment.PatientRegistrationNumber}', 
                  patient_name: '${appointment.FullName}', 
                  patient_appointment_datetime: '${format_datetime_local}', patient_appointment_category: '${appointment.AppointmentCategory}', 
                  patient_department: '${appointment.Department}', patient_appointment_information: '${appointment.AppointmentInformation}', user:'${appointment.User}',
                  formatted_datetime: '${formate_log_datetime}', appointment_id: '${appointment.AppointmentRegNum}'
                } )" title="Edit Appointment">
              <i class="bi bi-eye"></i>
            </button>      
          </td>
        `;
        tableBody.appendChild(row);
      });
      // <button class="btn btn-sm btn-outline-primary me-1" onclick = "loadPage('appointments/add_appointments', {patient_id: '${patient.PatientRegistrationNumber}', patient_name: '${patient.FullName}', 
      // patient_phone: '${patient.PhoneNumber}'})" title="Book Appointment"><i class="bi bi-calendar-plus"></i></button>

      // <button class="btn btn-sm btn-outline-primary" title="Edit Appointment" onclick = "loadPage('appointments/edit_appointments', {patient_id: '${appointment.PatientRegistrationNumber}', patient_name: '${patient.FullName}', patient_phone: '${patient.PhoneNumber}', 
      //           patient_appointment_datetime: '${patient.AppointmentDateTime}', patient_appointment_category: '${patient.AppointmentCategory}', 
      //           patient_department: '${patient.Department}', patient_information: '${patient.AppointmentInformation}'})">
      //         <i class="bi bi-eye"></i>
      //       </button>
    } catch (error) {
      console.error("❌ Error fetching appointment:", error);
      tableBody.innerHTML = `<tr><td colspan="7" class="text-danger text-center">Failed to load appointments</td></tr>`;
    } finally {
      hideLoader();
    }
  }

  // ----------------- Set up calendar ------------------- //
  flatpickr("#appointment_calendar", {
    defaultDate: new Date(),
    onChange: function (selectedDates) {
      // currentDate = selectedDates[0].toISOString().split("T")[0];
      // fetchAppointment(currentStatus, currentDate, currentSearchType, currentSearchValue);
      const localDate = selectedDates[0];
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, "0");
      const day = String(localDate.getDate()).padStart(2, "0");

      currentDate = `${year}-${month}-${day}`; // e.g., "2025-07-13"
      console.log("📅 Sending accurate local date:", currentDate);

      fetchAppointment(currentStatus, currentDate, currentSearchType, currentSearchValue);
    },
  });

  // ----------------- Set up tab click handlers ------------------- //
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      moveUnderline(btn);

      currentStatus = btn.getAttribute("data-status");
      fetchAppointment(currentStatus, currentDate, currentSearchType, currentSearchValue);
    });
  });

  // ----------------- Set up search input handler ------------------- //
  const searchInput = document.getElementById("search_value");
  const searchTypeSelect = document.getElementById("search_type");

  const handleSearch = debounce(() => {
    currentSearchType = searchTypeSelect.value;
    currentSearchValue = searchInput.value.trim().toUpperCase();

    if (currentSearchValue === "" || currentSearchValue.length > 2) {
      fetchAppointment(currentStatus, currentDate, currentSearchType, currentSearchValue);
    }
  }, 400);

  searchInput.addEventListener("input", handleSearch);
  searchTypeSelect.addEventListener("change", () => {
    currentSearchType = searchTypeSelect.value;
    handleSearch();
  });

  // ----------------- Page Initialization (default load) ------------------- //
  const activeBtn = document.querySelector(".tab-btn.active");
  if (activeBtn) {
    moveUnderline(activeBtn);
    currentStatus = activeBtn.getAttribute("data-status");
  }

  fetchAppointment(currentStatus, currentDate, currentSearchType, currentSearchValue);
}
