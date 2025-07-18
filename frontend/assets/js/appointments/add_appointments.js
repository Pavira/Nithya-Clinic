// -----------Add Appointment Form ----------------
async function AppointmentForm() {
  
  const appointmentForm = document.getElementById("add-appointment-form");
  if (!appointmentForm) {
    console.warn("⛔ Form not found!");
    return;
  }
    appointmentForm.addEventListener("submit", async function (e) {
      e.preventDefault();


      // ----------- Collect Form Data -----------
      console.log("Collecting appointment form data...");
      const reg_no = document.getElementById("reg_no").value;
      const fullName = document.getElementById("full_name").value;
      const phoneNumber = document.getElementById("phone").value;
      const consultationCategory = document.getElementById("consultation_category").value;
      const appointmentCategory = document.getElementById("appointment_category").value;
      const description = document.getElementById("description").value.trim();
      const startDateTime = document.getElementById("start_datetime").value;

         // Now you can send the form data
      const data = {
        patient_id: reg_no,
        full_name: fullName,
        phone_number : phoneNumber,
        consultation_category: consultationCategory,
        appointment_category: appointmentCategory,
        description: description,
        appointment_datetime: startDateTime     
      };

      console.log("Sending appointment data:", data);

      // Show loader while processing
      showLoader();      
      try {
        const token = localStorage.getItem("token");
        const response = await fetch('/api/v1/appointments/add_appointment', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data)
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

        // -------------------- Date and Time Formatting ----------------------
        // # Original ISO format string
        const isoString = startDateTime
        const date = new Date(isoString);

        const formatted_datetime = date.toLocaleString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata"
        }).replace(",", " at");

        console.log(formatted_datetime); // e.g., "12 July 2025 at 6:21 PM"
        // ------------------------------------------------------------------

        if (response.ok && result.success === true) {
          Swal.fire({
            icon: 'success',
            title: 'Appointment Confirmation!',
            text: `Appointment Created for ${fullName} on ${formatted_datetime}`,
            confirmButtonText: 'OK',
          }).then(() => {
            // Redirect after user clicks OK
            loadPage("appointments/view_appointments");
          });       
        }else if(response.ok && result.success === false) {
          Swal.fire({
            icon: 'warning',
            title: '⛔ Appointment creation failed',
            text: `Appointment already exists for this ${formatted_datetime}`,
          });          
        }
         else {
          Swal.fire({
            icon: 'error',
            title: '⛔ Appointment creation failed',
            text: result,
          });
          // alert("⛔ Patient creation failed");
        }
      } catch (err) {
        Swal.fire({
            icon: 'error',
            title: '⛔ Server error. Try again later.',
            text: err,
          });         
      }
      finally {
          hideLoader(); // Hide the loader
        }
    });
  }

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

// -----------------Check Appointment--------------
async function checkAppointment() {
  console.log("checking Appointment");
  token = localStorage.getItem("token");
  const response = await fetch(`/api/v1/appointments/check_appointment/${window.pageParams?.patient_id}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();

    console.log("testtt---" + result.data.appointments);
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
        if (response.ok && result.success === true) {
          const datetime = formatDateToText(result.data.appointments.AppointmentDateTime);
          Swal.fire({
            icon: 'warning',
            title: '⛔ Appointment already exists',
            text: `Active appointment already exists for ${window.pageParams?.patient_name} on ${datetime}. Do you want to proceed with a new appointment?`,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
          }).then((result) => {
            if (result.isConfirmed) {
              // ✅ User clicked "Yes" — do nothing (just close popup)
            } else if (result.isDismissed || result.isDenied || result.isCancelled) {
              // ❌ User clicked "No" — redirect
              loadPage("appointments/view_appointments");
            }
          });
        }else if(response.ok && result.success === false) {
          return;
        }
    console.log("Check Appointment:", result); 
}

async function initAppointmentPage() {

    showLoader();
    checkAppointment();
    
    try {
        const patientId = window.pageParams?.patient_id;
        const patientName = window.pageParams?.patient_name;
        const patientPhone = window.pageParams?.patient_phone;
        
        // console.log("Check appointment ---"+patientId);

        // Fill the form
        document.getElementById("reg_no").value = patientId === null ? "" : patientId;
        document.getElementById("full_name").value = patientName === null ? "" : patientName;
        document.getElementById("phone").value = patientPhone === null ? "" : patientPhone;

    } 
    catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: 'Server error: ' + err,
        })
        console.error(err);
    }
    finally {
        hideLoader();
    }
}


initAppointmentPage();

AppointmentForm();