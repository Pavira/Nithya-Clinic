
  
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
    loadPage("patients/view_patients");
  }
}

// ----------------- View Image Function ------------------- //
async function viewImage(appointmentId) {
  console.log("Viewing image for appointment ID:", appointmentId);

  showLoader();
  try {
    const response = await fetch(`/api/v1/appointments/view_image/${appointmentId}`, {
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
    console.log("Image result:", result);
    document.getElementById("image-body").innerHTML = ""; // Clear previous content

    if (result.success && result.data && result.data.image_urls.length > 0) {
      result.data.image_urls.forEach((url) => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Appointment Image";
        img.className = "img-fluid mb-3"; // Bootstrap responsive + spacing
        document.getElementById("image-body").appendChild(img);
      });

      // Show the modal
      const modal = new bootstrap.Modal(document.getElementById('imageModal'));
      modal.show();
    } else {
      Swal.fire({
        icon: "info",
        title: "No Image Found",
        text: "There are no images for this appointment.",
      });
    }
  } catch (error) {
    console.error("Error fetching image:", error);
    Swal.fire({
      icon: 'error',
      title: 'Failed!',
      text: 'Server error: ' + error,
    });
  }finally {
    hideLoader();
  }
}

// ----------------- View Precription Function ------------------- //
async function viewPrescription(appointmentId) {
  console.log("Viewing Precription for appointment ID:", appointmentId);

  showLoader();
  try {
    const response = await fetch(`/api/v1/appointments/view_prescription_image/${appointmentId}`, {
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
    console.log("Precription result:", result);
    document.getElementById("image-body").innerHTML = ""; // Clear previous content

    if (result.success && result.data && result.data.image_urls.length > 0) {
      result.data.image_urls.forEach((url) => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Appointment Prescription Image";
        img.className = "img-fluid mb-3"; // Bootstrap responsive + spacing
        document.getElementById("image-body").appendChild(img);
      });

      // Show the modal
      const modal = new bootstrap.Modal(document.getElementById('imageModal'));
      modal.show();
    } else {
      Swal.fire({
        icon: "info",
        title: "No Image Found",
        text: "There are no images for this appointment.",
      });
    }
  } catch (error) {
    console.error("Error fetching image:", error);
    Swal.fire({
      icon: 'error',
      title: 'Failed!',
      text: 'Server error: ' + error,
    });
  }finally {
    hideLoader();
  }
}

// --------------Calling getPrescription Function on Card Body Click-------------- //
document.querySelector(".card-body").addEventListener("click", function (e) {
    const button = e.target.closest("#viewPrescription");
    if (button) {
      e.preventDefault(); // 🛑 Prevent default form submission
      const appointmentId = button.getAttribute("data-index");
      console.log("Viewing prescription for appointment ID:", appointmentId);
      reg_no = window.pageParams?.reg_no;
      getPrescription(appointmentId, reg_no);
    }
  });
// ---------------------------------------------------------------------
// --------------Calling View Image Function on Card Body Click-------------- //
document.querySelector(".card-body").addEventListener("click", function (e) {
    const button = e.target.closest("#viewImage");
    if (button) {
      e.preventDefault(); // 🛑 Prevent default form submission
      const appointmentId = button.getAttribute("data-index");
      console.log("Viewing Image for appointment ID:", appointmentId);
      viewImage(appointmentId);
    }
  });
// ---------------------------------------------------------------------
// --------------Calling View Prescription Function on Card Body Click-------------- //
document.querySelector(".card-body").addEventListener("click", function (e) {
    const button = e.target.closest("#viewPrescriptionImage");
    if (button) {
      e.preventDefault(); // 🛑 Prevent default form submission
      const appointmentId = button.getAttribute("data-index");
      console.log("Viewing Prescription for appointment ID:", appointmentId);
      viewPrescription(appointmentId);
    }
  });
// ---------------------------------------------------------------------


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

    if (!data || Object.keys(data).length === 0) {
      document.querySelector(".card-body").innerHTML = "No Appointment History Found";
      return; // stop further processing
    }

    // 🧩 Create the HTML dynamically
    let cardBodyHTML = "";

    data.sort((a, b) => new Date(b.AppointmentDateTime) - new Date(a.AppointmentDateTime));

    data.forEach((data, index) => {

      let medPrescBtn = "";
      let imageBtn = "";

      if (data.MedPrescImages && data.MedPrescImages.length > 0) {
        medPrescBtn = `
          <button type="button" class="btn btn-primary me-2" id="viewPrescriptionImage" data-index="${data.AppointmentRegNum}">
            <i class="bi bi-file-earmark-medical me-1"></i> View Prescription
          </button>
        `;
      }

      if (data.ImageURLs && data.ImageURLs.length > 0) {
        imageBtn = `
          <button type="button" class="btn btn-warning" id="viewImage" data-index="${data.AppointmentRegNum}">
            <i class="bi bi-image me-1"></i> View Image
          </button>
        `;
      }

      cardBodyHTML += `
        <form id="add-appointment-form-${index}" class="mb-4 border p-3 rounded shadow-sm bg-white">
          <div class="row">
            <div class="col-12">
              <h6 class="text-primary border-bottom pb-2">
                Appointment Number :  <span id="appointment_no">${data.AppointmentNumber}</span>
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

            <div class="d-flex justify-content-center align-items-center mt-2 gap-2"> 

              ${medPrescBtn}
              ${imageBtn}                     
              
              <button type="button" class="btn btn-danger" id="viewPrescription" data-index="${data.AppointmentRegNum}">
                <i class="bi bi-file-earmark-pdf me-1"></i> View Prescription
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



