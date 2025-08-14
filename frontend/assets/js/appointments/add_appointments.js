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
        appointment_datetime: startDateTime,
        user: localStorage.getItem("email")   
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
// Check if browser supports SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert("Your browser does not support Speech Recognition. Try Chrome or Edge.");
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop after speaking
    recognition.interimResults = true; // Show speech as you speak
    recognition.lang = "en-IN"; // Language (change if needed)

    const micButton = document.getElementById("micButton");
    const transcriptOutput = document.getElementById("transcript");

    micButton.addEventListener("click", () => {
        recognition.start();
        transcriptOutput.innerText = "Listening...";
    });

    recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        transcriptOutput.innerText = transcript;
    };

    recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
    };

    recognition.onend = () => {
        console.log("Speech recognition ended.");
    };
}

function initspeech() {
  const micButton = document.getElementById("micButton");
  const descriptionField = document.getElementById("description");

  // Speech Recognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-IN"; // Change language if needed
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      insertAtCursor(descriptionField, transcript + " ");
    };

    recognition.onerror = function(event) {
      console.error("Speech recognition error:", event.error);
      micButton.classList.remove("listening");
    };

    recognition.onstart = function() {
      micButton.classList.add("listening"); // Show mic active
    };

    recognition.onend = function() {
      micButton.classList.remove("listening"); // Remove active state
    };
  } else {
    alert("Your browser does not support Speech Recognition.");
  }

  micButton.addEventListener("click", () => {
    if (recognition) {
      recognition.start();
    }
  });

  // Function to insert text at cursor position
  function insertAtCursor(field, text) {
    const start = field.selectionStart;
    const end = field.selectionEnd;
    field.value = field.value.substring(0, start) + text + field.value.substring(end);
    field.selectionStart = field.selectionEnd = start + text.length;
    field.focus();
  }
}


initAppointmentPage();
initspeech();
AppointmentForm();