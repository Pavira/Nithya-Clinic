  // ----------------- Format Date to Text ------------------- //
  function formatDateTime(dateString) {
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

function goBack() {
  const lastPage = window.appHistory.pop();
  if (lastPage) {
    console.log("Navigating back to:", lastPage.page);
    loadPage(lastPage.page, lastPage.params);
    setTimeout(() => {
      window.scrollTo(0, lastPage.scrollY || 0);
    }, 100);
  } else {
    loadPage("appointments/view_appointments");
  }
}

async function initAppointmentHistory() {
  showLoader();
  try {
    const reg_no = window.pageParams?.reg_no;
    document.querySelector(".card-body").innerHTML = "";

    // 🟢 Fetch appointment history by reg_no
    const response = await fetch(`/api/v1/appointments/view_appointment_history?reg_no=${encodeURIComponent(reg_no)}`,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
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


    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to fetch patient history");
    }

    const data = result.data.appointments;

    // 🧩 Create the HTML dynamically
    let cardBodyHTML = "";

    data.forEach((data, index) => {
      cardBodyHTML += `
        <form id="add-appointment-form-${index}" class="mb-4 border p-3 rounded shadow-sm bg-white">
          <div class="row">
            <div class="col-12">
              <h6 class="text-primary border-bottom pb-2">
                Appointment Number :- <span id="appointment_no">${data.AppointmentNumber}</span>
              </h6>
            </div>

            <div class="col-md-4">
              <label class="form-label">Registration Number</label>
              <input type="text" class="form-control bg-light" value="${data.PatientRegistrationNumber}" readonly>
            </div>

            <div class="col-md-4">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-control bg-light" value="${data.FullName}" readonly>
            </div>

            <div class="col-md-4">
              <label class="form-label">Start Date & Time</label>
              <input type="text" class="form-control" value="${formatDateTime(data.AppointmentDateTime)}" readonly>
            </div>

            <div class="col-md-6 mt-2">
              <label class="form-label">Consultation Category</label>
              <input type="text" class="form-control" value="${data.Department}" readonly>
            </div>

            <div class="col-md-6 mt-2">
              <label class="form-label">Appointment Category</label>
              <input type="text" class="form-control" value="${data.AppointmentCategory}" readonly>
            </div>

            <div class="col-12 mt-2">
              <label class="form-label">Description Details</label>
              <textarea class="form-control" rows="3" readonly>${data.AppointmentInformation}</textarea>
            </div>

            <div class="col-md-6 mt-2">
              <label class="form-label">Doctor Fees</label>
              <input type="text" class="form-control" value="${data.DoctorFees}" readonly>
            </div>

            <div class="col-md-6 mt-2">
              <label class="form-label">Appointment Status</label>
              <input type="text" class="form-control" value="${data.AppointmentStatus}" readonly>
            </div>

            <p class="text-muted mt-2">${data.AppointmentStatus} on ${formatDateTime(data.AppointmentDateTime)} by ${data.User}</p>

            <div class="d-flex justify-content-center align-items-center mt-2">
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-file-earmark-pdf me-1"></i> View PDF
              </button>
            </div>
          </div>
        </form>
      `;
    });

    // 🔄 Replace card body content
    document.querySelector(".card-body").innerHTML = cardBodyHTML;

  } catch (error) {
    console.error(error);
    document.querySelector(".card-body").innerHTML = `<div class="text-danger text-center">❌ ${error.message}</div>`;
  }finally{
    hideLoader();
  }
}

initAppointmentHistory();