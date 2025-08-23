
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// -----------Retrieve Prescription Table details helper function ----------------
function getPrescriptionTableData() {
  console.log("getPrescriptionTableData");
    const tableData = [];
    const rows = document.querySelectorAll('#prescription-table tbody tr');

    if (rows.length === 0) {
        return tableData;
    }
    rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        const serial = parseInt(cells[0].innerText.trim());
        const drug = cells[1].innerText.trim();
        const frequency = cells[2].innerText.trim();
        const duration_value = cells[3].innerText.trim();
        const duration_unit = cells[4].innerText.trim();
        const instruction = cells[6].innerText.trim();
        

        // Extract timing badges
        const timingBadges = Array.from(cells[5].querySelectorAll('.badge')).map(badge => badge.innerText.trim());
        const timingFlags = {
            M: timingBadges.includes('M'),
            A: timingBadges.includes('A'),
            E: timingBadges.includes('E'),
            N: timingBadges.includes('N'),
            'B/F': timingBadges.includes('B/F'),
            'A/F': timingBadges.includes('A/F')
        };

        tableData.push({
            serial,
            drug: drug === null || '' ? '' : drug,
            frequency: frequency === null || '' ? '' : frequency,
            duration_value: duration_value === null || '' ? '' : duration_value,
            duration_unit: duration_unit === null || '' ? '' : duration_unit,
            instruction: instruction === null || '' ? '' : instruction,          
            ...timingFlags
        });
    });

    return tableData;
}


// -----------Edit Appointment Form ----------------
async function EditAppointmentForm() {
  console.log("EditAppointmentForm ");
  
  const editAppointmentForm = document.getElementById("closeAppointment");
  if (!editAppointmentForm) {
    console.warn("⛔ Form not found!");
    return;
  }
    editAppointmentForm.addEventListener("click", async function (e) {
      e.preventDefault();


      // ----------- Collect Form Data -----------
      // console.log("Collecting appointment form data...");
      const reg_no = document.getElementById("reg_no").value;
      const fullName = document.getElementById("full_name").value;
      const consultationCategory = document.getElementById("consultation_category").value;
      const appointmentCategory = document.getElementById("appointment_category").value;
      const description = document.getElementById("description").value;
    //   const startDateTime = document.getElementById("start_datetime").value;
      const height = parseFloat(document.getElementById("height").value) || 0;
      const weight = parseFloat(document.getElementById("weight").value) || 0;
      const bmi = parseFloat(document.getElementById("bmi").value) || 0;
      const blood_pressure = document.getElementById("blood_pressure").value || 0;
      const pulse = parseFloat(document.getElementById("pulse").value) || 0;
      const history = document.getElementById("history").value || '';
      const clinical_feature = document.getElementById("clinical_feature").value || '';
      const investigation = document.getElementById("investigation").value || '';
      const diagnosis = document.getElementById("diagnosis").value || '';
      const localDateTimeString = document.getElementById("review_datetime").value;
      const utcDate = new Date(localDateTimeString);
      const doctor_fees = document.getElementById("doctor_fees").value || '';
      const allPrescriptions = getPrescriptionTableData(); // Get prescription table data
      const images = document.getElementById("upload_images")?.files || [];
      const prescriptionImages = document.getElementById("upload_prescriptions")?.files || [];
      const noOfImages = images.length;
      const noOfPrescriptions = prescriptionImages.length;

      if(!consultationCategory || !appointmentCategory){
        Swal.fire({
          icon: 'Warning',
          title: 'Warning',
          text: 'Please fill in all the required fields.'
        })      
        return
      }

      if(doctor_fees === ""){
        Swal.fire({
          icon: 'Warning',
          title: 'Warning',
          text: 'Please fill Doctor Fees'
        })      
        return
      }

      const formData = new FormData();

         // Now you can send the form data
      const data = {
        consultation_category: consultationCategory,
        appointment_category: appointmentCategory,
        description: description,
        height : height ,
        weight : weight ,
        bmi : bmi ,
        blood_pressure : blood_pressure ,
        pulse : pulse ,
        history : history,
        clinical_feature : clinical_feature,
        investigation : investigation,
        diagnosis : diagnosis,
        doctor_fees : doctor_fees,
        review_datetime : utcDate || null,
        allPrescriptions : allPrescriptions,     
        images : images,
        prescription_images : prescriptionImages,
        noOfImages : noOfImages,
        noOfPrescriptions : noOfPrescriptions
      };

      formData.append("data", JSON.stringify(data));

      // Append individual files
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          formData.append("images", images[i]);
        }
      }

      if (prescriptionImages && prescriptionImages.length > 0) {
        for (let i = 0; i < prescriptionImages.length; i++) {
          formData.append("prescription_images", prescriptionImages[i]);
        }
      }

      // console.log("Sending appointment data:", data);
      // console.log("Appointment id:", window.pageParams?.appointment_id);

      const user = window.pageParams?.user;

      // Show loader while processing
      showLoader();      
      try {
        const token = localStorage.getItem("token");
        console.log(`/api/v1/appointments/edit_appointment/${window.pageParams?.appointment_id}/${user}`);
        const response = await fetch(`/api/v1/appointments/edit_appointment/${window.pageParams?.appointment_id}/${user}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData
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

        if (response.ok && result.success === true) {
          Swal.fire({
            icon: 'success',
            title: 'Appointment Closed!',
            text: `Appointment Closed for ${fullName}`,
            confirmButtonText: 'OK',
          }).then(() => {
            // Redirect after user clicks OK
            getPrescription(window.pageParams?.appointment_id,reg_no);
            loadPage("appointments/view_appointments");
          });       
        }
         else {
          Swal.fire({
            icon: 'error',
            title: '⛔ Appointment closing failed',
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

async function initPrescription() {
  console.log("initPrescription");
  // -----------Prescription Table ----------------
    let prescriptionList = [];
    let prescriptionSerial = 1;

    // Handle toggle for timing buttons
    document.getElementById('timing-buttons').addEventListener('click', function (e) {
    if (e.target.classList.contains('timing-btn')) {
        e.target.classList.toggle('btn-outline-secondary');
        e.target.classList.toggle('btn-success');
        e.target.classList.toggle('active');
    }
    });

    document.getElementById('add-medicine-btn').addEventListener('click', function (e) {
      e.preventDefault();

      // function truncateText(text, limit = 15) {
      //   return text.length > limit ? text.substring(0, limit) + "..." : text;
      // }

      // Get the real values
      const drug = document.getElementById('drug_name').value.trim();
      const frequency = document.getElementById('frequency').value.trim();
      const duration_value = document.getElementById('duration_value').value.trim() || '';
      const duration_unit = document.getElementById('duration_unit').value.trim() || '';
      const instruction = document.getElementById('instruction').value.trim() || '';

      // Display values (truncated for frontend)
      // const drugDisplay = truncateText(drugFull);
      // const frequencyDisplay = truncateText(frequencyFull);
      // const instructionDisplay = truncateText(instructionFull);

      if (!drug || !duration_value) {
          Swal.fire({
              icon: 'warning',
              title: 'Validation',
              text: 'Please fill in all the required fields.',
          })
          return;
      }

      // Get timing selection
      const timingFlags = {};
      document.querySelectorAll('.timing-btn').forEach(btn => {
          timingFlags[btn.dataset.value] = btn.classList.contains('active');
      });

      const prescriptionItem = {
          serial: prescriptionSerial++,
          drug,
          frequency,
          duration_value,
          duration_unit,
          instruction,
          ...timingFlags,
      };

      prescriptionList.push(prescriptionItem);
      updatePrescriptionTable();
      resetPrescriptionForm();
    });

    function resetPrescriptionForm() {
       // Reset Select2 dropdown (drug name)
      // $('#drug_name').val(null).trigger('change');
      document.getElementById('drug_name').value = '';
      document.getElementById('duration_value').value = '';
      document.getElementById('duration_unit').value = 'day(s)'; // Reset to default unit
      frequencySelect = document.getElementById('frequency');
      frequencySelect.innerHTML = `<option value="">Select Frequency</option>`;
      document.getElementById('instruction').value = '';
      document.querySelectorAll('.timing-btn').forEach(btn => {
          btn.classList.remove('btn-success', 'active');
          btn.classList.add('btn-outline-secondary');
      });
    }

    // Delete prescription
    // function deletePrescription(index) {
    //     prescriptionList.splice(index, 1);
    //     updatePrescriptionTable();
    // }

    document.querySelector('#prescription-table tbody').addEventListener('click', function (e) {
        if (e.target.closest('.delete-btn')) {
            const index = parseInt(e.target.closest('.delete-btn').dataset.index);
            if (!isNaN(index)) {
                prescriptionList.splice(index, 1);
                updatePrescriptionTable();
            }
        }
    });


    function updatePrescriptionTable() {
      const tbody = document.querySelector('#prescription-table tbody');
      tbody.innerHTML = '';

      prescriptionList.forEach((item, index) => {
          const timingDisplay = Object.entries(item)
          .filter(([key, value]) => ['M','A','E','N','B/F','A/F'].includes(key) && value)
          .map(([key]) => `<span class="badge bg-primary me-1">${key}</span>`)
          .join('');

          const row = `
          <tr>
              <td>${index + 1}</td>
              <td>${item.drug}</td>
              <td>${item.frequency}</td>
              <td>${item.duration_value}</td>
              <td>${item.duration_unit}</td>
              <td>${timingDisplay || '<em>No Timing</em>'}</td>
              <td>${item.instruction || ''}</td>
              <td>
                <button type="button" class="btn btn-sm btn-danger delete-btn" data-index="${index}">
                    <i class="bi bi-trash"></i>
                </button>
              </td>
          </tr>
          `;
          tbody.insertAdjacentHTML('beforeend', row);
      });
    }

}

// ------------------ BMI Calculation ------------------
function setupBMICalculation() {
  console.log("setupBMICalculation");
  const weightInput = document.getElementById('weight');
  const heightInput = document.getElementById('height');
  const bmiInput = document.getElementById('bmi');

  function calculateBMI() {
    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value);

    if (!isNaN(weight) && !isNaN(height) && height > 0) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      bmiInput.value = bmi.toFixed(2);
    } else {
      bmiInput.value = '';
    }
  }

  weightInput.addEventListener('input', calculateBMI);
  heightInput.addEventListener('input', calculateBMI);
}

// -----------------Save Vitals Functionality ------------------
async function saveVitals() {
  console.log("SaveVitals");

    document.getElementById("save_vitals").addEventListener("click", async function (e) {
      e.preventDefault();

      // ----------- Collect Form Data -----------
        // console.log("Collecting vitals form data...");
        const height = parseFloat(document.getElementById("height").value) || 0;
        const weight = parseFloat(document.getElementById("weight").value) || 0;
        const bmi = parseFloat(document.getElementById("bmi").value) || 0;
        const blood_pressure = document.getElementById("blood_pressure").value || 0;
        const pulse = parseFloat(document.getElementById("pulse").value) || 0;
        const reg_no = document.getElementById("reg_no").value;


         // Now you can send the form data
      const data = {
        height : height ,
        weight : weight ,
        bmi : bmi ,
        blood_pressure : blood_pressure ,
        pulse : pulse 
      };

      // console.log("Sending vitals data:", data);

      // Show loader while processing
      showLoader();      
      try {
        const token = localStorage.getItem("token");
        console.log(`/api/v1/appointments/save_vitals/${window.pageParams?.appointment_id}`);
        const response = await fetch(`/api/v1/appointments/save_vitals/${window.pageParams?.appointment_id}`, {
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

        if (response.ok && result.success === true) {
          Swal.fire({
            icon: 'success',
            title: 'Vitals Saved ',
            text: `Height: ${height}CM, \n Weight: ${weight}KG, \n BMI: ${bmi}, \n Blood Pressure: ${blood_pressure} mmHg, \n Pulse: ${pulse} bpm`,
            // confirmButtonText: 'OK',
          });       
        }
         else {
          Swal.fire({
            icon: 'error',
            title: '⛔ Vitals creation failed',
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

//-----------------Fetch Vitals Data ------------------
async function fetchVitalsData() {
  console.log("fetchVitalsData");

  try {
    const token = localStorage.getItem("token");
    console.log(`/api/v1/appointments/fetch_vitals/${window.pageParams?.appointment_id}`);
    const response = await fetch(`/api/v1/appointments/fetch_vitals/${window.pageParams?.appointment_id}`, {
      method: 'GET',
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
    // console.log("Fetched vitals data:", result);
    return result.data.vitals;
    
    } catch (err) {
        // alert("Server error. Try again later.");
        console.error(err);
    }
}

// ------------------Cancel Appointment ------------------
async function CancelAppointment() {
  console.log("CancelAppointment");

    document.getElementById("cancelAppointment").addEventListener("click", async function (e) {
      e.preventDefault();
      const fullName = document.getElementById("full_name").value;
      // ----------- Collect Form Data -----------
      showLoader();      
      try {
        const token = localStorage.getItem("token");
        console.log(`/api/v1/appointments/cancel_appointment/${window.pageParams?.appointment_id}`);
        const response = await fetch(`/api/v1/appointments/cancel_appointment/${window.pageParams?.appointment_id}`, {
          method: 'GET',
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

        if (response.ok && result.success === true) {
          Swal.fire({
            icon: 'success',
            title: 'Appointment Cancelled ',
           text: `Appointment Cancelled for ${fullName}`,
            // confirmButtonText: 'OK',
          }).then(() => {
            // Redirect after user clicks OK
            loadPage("appointments/view_appointments");
          });      
        }
         else {
          Swal.fire({
            icon: 'error',
            title: '⛔ Appointment cancel failed',
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


// -----------------Date for Datetime Local Input ------------------- //
function formatDateForDatetimeLocalInput(dateStr) {
  const date = new Date(dateStr); // convert string to Date object
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
// ---------------------------

function micfunction() {
  console.log("micfunction");
  document.querySelectorAll('.micButton').forEach(button => {
    let targetId = button.getAttribute('data-target');
    let textarea = document.getElementById(targetId);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    let recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      insertAtCursor(textarea, transcript + " ");
    };

    recognition.onerror = function(event) {
      console.error("Speech recognition error:", event.error);
      button.classList.remove("listening");
    };

    recognition.onstart = function() {
      button.classList.add("listening"); // Show mic active
    };

    recognition.onend = function() {
      button.classList.remove("listening"); // Remove active state
    };

    button.addEventListener('click', () => {
      recognition.start();
    });

    // Function to insert text at cursor position
    function insertAtCursor(field, text) {
      const start = field.selectionStart;
      const end = field.selectionEnd;
      field.value = field.value.substring(0, start) + text + field.value.substring(end);
      field.selectionStart = field.selectionEnd = start + text.length;
      field.focus();
    }
  });
}

async function fetchVitalsData() {
  showLoader();
  try{
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
  }catch(err){
    console.error(err);
  }finally{
    hideLoader();
  }
}

// ------------------Init Edit Appointments Page ------------------
async function initEditAppointmentsPage() {
  console.log("initEditAppointmentsPage");

    showLoader();
    // Initialize Mic Function  
    micfunction();

    try {
        // console.log("Appointment ID:-"+ window.pageParams?.appointment_id);

        // ----------Fetch Vitals Data----------
        const vitals = await fetchVitalsData();        

        const appointment_status = vitals.AppointmentStatus;
        const doctor_fees = vitals.DoctorFees;
        const review_datetime = vitals.ReviewDate;
        if(!review_datetime || review_datetime === null || review_datetime === undefined) {
            document.getElementById("review_datetime").value = '';
        }
        // console.log("Review Date:-"+ review_datetime);
        const prescription = vitals.Prescription;
        // console.log("Prescription:-"+ prescription);
        const history = vitals.History;
        const clinical_feature = vitals.ClinicalFeature;
        const investigation = vitals.Investigation;
        const diagnosis = vitals.Diagnosis;


        const timingOptions = ['M', 'A', 'E', 'N', 'B/F', 'A/F'];
        const timingButtonsHTML = timingOptions.map(timing => `
        <button type="button" class="btn btn-outline-secondary btn-sm timing-btn" data-value="${timing}">
            ${timing}
        </button>
        `).join('');

        document.getElementById('timing-buttons').innerHTML = timingButtonsHTML;
        
        // ----------Function For Cancel Appointment Start----------
        if (appointment_status === "Cancelled") {
            document.getElementById("cancelAppointment").style.display = "none";
            document.getElementById("closeAppointment").style.display = "none";

          document.getElementById("consultation_category").disabled = true;
          document.getElementById("appointment_category").disabled = true;
          document.getElementById("description").disabled = true;
        
          document.getElementById("view_appointment_history").style.display = "none";
          document.getElementById("investigation_heading").style.display = "none";
          document.getElementById("vitals_heading").style.display = "none";

          document.getElementById("history_label").style.display = "none";
          document.getElementById("history").style.display = "none";
          document.getElementById("clinical_feature_label").style.display = "none";
          document.getElementById("clinical_feature").style.display = "none";
          document.getElementById("investigation_label").style.display = "none";
          document.getElementById("investigation").style.display = "none";
          document.getElementById("diagnosis_label").style.display = "none";
          document.getElementById("diagnosis").style.display = "none";

          document.getElementById("height_label").style.display = "none";
          document.getElementById("weight_label").style.display = "none";
          document.getElementById("bmi_label").style.display = "none";
          document.getElementById("blood_pressure_label").style.display = "none";
          document.getElementById("pulse_label").style.display = "none";
          document.getElementById("height").style.display = "none";
          document.getElementById("weight").style.display = "none";
          document.getElementById("bmi").style.display = "none";
          document.getElementById("blood_pressure").style.display = "none";
          document.getElementById("pulse").style.display = "none";
          document.getElementById("save_vitals").style.display = "none";

          document.getElementById("prescription_heading").style.display = "none";
          document.getElementById("prescription-table").style.display = "none";

          $('#drug_name').hide();
          $('#drug_name').next('.select2-container').hide();
          document.getElementById("duration_value").style.display = 'none';
          document.getElementById("duration_value_label").style.display = 'none';
          document.getElementById("duration_value").style.display = 'none';
          document.getElementById("frequency_label").style.display = 'none';
          document.getElementById("frequency").style.display = 'none';
          document.getElementById("instruction_label").style.display = 'none'; 
          document.getElementById("instruction").style.display = 'none';
          document.getElementById("duration_unit_label").style.display = 'none';
          document.getElementById("duration_unit").style.display = 'none';
          document.getElementById("timing_label").style.display = 'none';
          document.getElementById("timing-buttons").style.display = 'none';         
          document.getElementById("drug_name_label").style.display = 'none';
          document.getElementById("duration_value_label").style.display = 'none';
          document.getElementById("add-medicine-btn").style.display = 'none';
          document.getElementById('timing-buttons').innerHTML = '';
          
          document.getElementById("review_datetime_label").style.display = "none";
          document.getElementById("review_datetime").style.display = "none";
          document.getElementById("doctor_fees_label").style.display = "none";
          document.getElementById("doctor_fees").style.display = "none";
          
          document.getElementById("upload_images").style.display = 'none';
          document.getElementById("upload_prescriptions").style.display = 'none';
          document.getElementById("upload_images_label").style.display = 'none';
          document.getElementById("upload_prescriptions_label").style.display = 'none';
        }
        // ----------Function For Cancel Appointment Ends----------
        // ----------Function For Closed Appointment Start----------
        if(appointment_status === "Closed" ) {
            document.getElementById("cancelAppointment").disabled = true;
            document.getElementById("closeAppointment").disabled = true;
            document.getElementById("review_datetime").value = formatDateForDatetimeLocalInput(review_datetime) || '';
            document.getElementById("doctor_fees").value = doctor_fees;
            document.getElementById("history").value = history || '';
            document.getElementById("clinical_feature").value = clinical_feature || '';
            document.getElementById("investigation").value = investigation || '';
            document.getElementById("diagnosis").value = diagnosis || '';
            $('#drug_name').hide();
            $('#drug_name').next('.select2-container').hide();
            document.getElementById("duration_value_label").style.display = 'none';
            document.getElementById("duration_value").style.display = 'none';
            document.getElementById("frequency_label").style.display = 'none';
            document.getElementById("frequency").style.display = 'none';
            document.getElementById("instruction_label").style.display = 'none'; 
            document.getElementById("instruction").style.display = 'none';
            document.getElementById("duration_unit_label").style.display = 'none';
            document.getElementById("duration_unit").style.display = 'none';
            document.getElementById("timing_label").style.display = 'none';
            document.getElementById("timing-buttons").style.display = 'none';         
            document.getElementById("drug_name_label").style.display = 'none';
            document.getElementById("duration_value_label").style.display = 'none';
            document.getElementById("add-medicine-btn").style.display = 'none';
            document.getElementById('timing-buttons').innerHTML = '';

            document.getElementById("consultation_category").disabled = true;
            document.getElementById("appointment_category").disabled = true;
            document.getElementById("description").disabled = true;
            document.getElementById("weight").disabled = true;
            document.getElementById("height").disabled = true;
            document.getElementById("bmi").disabled = true;
            document.getElementById("blood_pressure").disabled = true;
            document.getElementById("pulse").disabled = true;
            document.getElementById("history").disabled = true;
            document.getElementById("clinical_feature").disabled = true;
            document.getElementById("investigation").disabled = true;
            document.getElementById("diagnosis").disabled = true;
            document.getElementById("review_datetime").disabled = true;
            document.getElementById("doctor_fees").disabled = true;
            // document.getElementById("upload_images").disabled = true;
            // document.getElementById("upload_prescriptions").disabled = true;
            document.getElementById("save_vitals").style.display = 'none';
            document.getElementById("upload_images").style.display = 'none';
            document.getElementById("upload_prescriptions").style.display = 'none';
            document.getElementById("upload_images_label").style.display = 'none';
            document.getElementById("upload_prescriptions_label").style.display = 'none';
            
            const prescriptionTableBody = prescription.map((item, index) => {
            const timings = [];

            if (item.M) timings.push("M");
            if (item.A) timings.push("A");
            if (item.E) timings.push("E");
            if (item.N) timings.push("N");
            if (item["B/F"]) timings.push("B/F");
            if (item["A/F"]) timings.push("A/F");

            return `
              <tr>
                <td>${index + 1}</td>
                <td>${item.drug}</td>
                <td>${item.frequency}</td> 
                <td>${item.duration_value}</td>
                <td>${item.duration_unit}</td>
                <td>${timings.join(", ")}</td>
                <td>${item.instruction || ''}</td>
                <td>"N/A"</td>
              </tr>
            `;
          }).join("");

          document.getElementById("prescription-table-body").innerHTML = prescriptionTableBody;
              }
          
          // ----------Function For Closed Appointment End----------

          // ----------Function For New Appointment Start----------
          document.getElementById("height").value= vitals.Height ?? '';
          document.getElementById("weight").value= vitals.Weight ?? '';
          document.getElementById("bmi").value= vitals.BMI ?? '';
          document.getElementById("blood_pressure").value= vitals.BP ?? '';
          document.getElementById("pulse").value= vitals.Pulse ?? '';

          const patientId = window.pageParams?.patient_id;
          const patientName = window.pageParams?.patient_name;
          // const patientPhone = window.pageParams?.patient_phone;
          const patientDepartment = window.pageParams?.patient_department;
          const patientAppointmentCategory = window.pageParams?.patient_appointment_category;
          const patientAppointmentInformation = window.pageParams?.patient_appointment_information;
          const patientAppointmentDateTime = window.pageParams?.patient_appointment_datetime;
          const formatedDateTime = window.pageParams?.formatted_datetime;
          const user = window.pageParams?.user;
          
          // console.log(patientId);

          // Fill the form
          document.getElementById("reg_no").value = patientId === null ? "" : patientId;
          document.getElementById("full_name").value = patientName === null ? "" : patientName;
          // document.getElementById("phone").value = patientPhone === null ? "" : patientPhone;
          document.getElementById("consultation_category").value = patientDepartment === null ? "" : patientDepartment;
          document.getElementById("appointment_category").value = patientAppointmentCategory === null ? "" : patientAppointmentCategory;
          document.getElementById("description").value = patientAppointmentInformation === null ? "" : patientAppointmentInformation;
          document.getElementById("start_datetime").value = patientAppointmentDateTime === null ? "" : patientAppointmentDateTime;
          document.getElementById("appointment-info").textContent = `This appointment was created on ${formatedDateTime} by ${user}.`;

          // Drug Name from local storage(Already stored in local storage when log in)
          localStorageDrugList =  JSON.parse(localStorage.getItem('drug_list')) ?? [];
          if (localStorageDrugList.length > 0) {
            localStorageDrugList.forEach((item) => {
              const option = document.createElement("option");
              option.value = item.drug_name;
              option.textContent = item.drug_name;
              document.getElementById("drug_name").appendChild(option);
            });
          }else{
            fetchDrugNames();
          }

          // ----------Function For New Appointment Ends----------
      } catch (error) {
        console.error(error);
      }finally{
        hideLoader();
      }
    }


// ------------Fetching Durg Name Dropdown Start------------
        // Drug Name Dropdown Initialization
      //  const drugMap = new Map(); // key: DrugName, value: DrugCategoryId
      //  async function fetchDrugNames() {
      //   const token = localStorage.getItem("token");
      //   const searchValue = document.getElementById("drug_name").value.trim().toUpperCase();
      //   const datalist = document.getElementById("drug_name_options");

      //   // showLoader();

      //   try {
      //     const queryParams = new URLSearchParams({
      //       search_type: "drug_name",
      //       search_value: searchValue,
      //       limit: 10, // or whatever reasonable limit
      //     });
      //     console.log("view_and_search_drug_names");
      //     const response = await fetch(`/api/v1/drug_names/view_and_search_drug_names?${queryParams}`, {     
      //       method: "GET",
      //       headers: {
      //         "Content-Type": "application/json",
      //         Authorization: `Bearer ${token}`,
      //       },
      //     });

      //     if (response.status === 401) {
      //       Swal.fire({
      //         icon: 'warning',
      //         title: 'Session Expired',
      //         text: 'Your session has expired. Please sign in again.',
      //       }).then(() => {
      //         localStorage.removeItem("token");
      //         window.location.href = "/";
      //       });
      //       return;
      //     }

      //     const result = await response.json();
      //     const drugs = result.data || [];

      //     // Clear previous options
      //     datalist.innerHTML = "";
      //     drugMap.clear();

      //     // Add new options
      //     drugs.forEach(drug => {
      //       const option = document.createElement("option");
      //       option.value = drug.DrugName || "";
      //       datalist.appendChild(option);

      //       // Store category ID for this drug
      //       if (drug.DrugName && drug.DrugCategoryId) {
      //         drugMap.set(drug.DrugName, drug.DrugCategoryId);
      //       }
      //     });

      //     //Function to detect the selected drug 
      //     document.getElementById("drug_name").addEventListener("change", async () => {
      //       const selectedDrug = document.getElementById("drug_name").value.trim();
      //       const categoryId = drugMap.get(selectedDrug);
      //       // console.log("Selected Drug:", categoryId);

      //       if (!categoryId) {
      //         console.warn("No category found for drug:", selectedDrug);
      //         return;
      //       }

      //       try {
      //         await fetchCategoryDescriptions(categoryId);
      //       } catch (err) {
      //         console.error("Error loading category descriptions:", err);
      //       }
      //     });
          // Function to fetch category descriptions based on selected drug
        //   async function fetchCategoryDescriptions(categoryId) {
        //     console.log("fetchCategoryDescriptions");
        //     const token = localStorage.getItem("token");
        //     const notesSelect = document.getElementById("frequency");

        //     notesSelect.innerHTML = `<option value="">Select Frequency</option>`;
        //     // showLoader();

        //     try {
        //       console.log(`/api/v1/drug_category/${categoryId}/descriptions`);
        //       const response = await fetch(`/api/v1/drug_category/${categoryId}/descriptions`, {
        //         method: "GET",
        //         headers: {
        //           "Content-Type": "application/json",
        //           Authorization: `Bearer ${token}`,
        //         },
        //       });

        //       if (!response.ok) {
        //         throw new Error("Failed to fetch category descriptions");
        //       }

        //       const result = await response.json();
        //       const descriptions = result.data || [];

        //       // Clear existing options
        //       notesSelect.innerHTML = `<option value="">Select Frequency</option>`;

        //       descriptions.forEach((desc, index) => {
        //         const option = document.createElement("option");
        //         option.value = desc; // or you can use `desc.id` if needed
        //         option.textContent = desc;
        //         notesSelect.appendChild(option);
        //       });

        //     } catch (err) {
        //       console.error("Error fetching descriptions:", err);
        //     } 
        //     // finally {
        //     //   hideLoader();
        //     // }
        //   }


        // } catch (error) {
        //   console.error("Error fetching drug names:", error);
        //   // Optionally show error toast
        // } 
        // finally {
        //   hideLoader();
        // }
      // }

      // const drugNameInput = document.getElementById("drug_name");

      // const handleSearch = debounce(() => {
      //   const value = drugNameInput.value.trim();
      //   if (value.length > 3) {
      //     fetchDrugNames();
      //   }
      // }, 400);

      // drugNameInput.addEventListener("input", handleSearch);        
      //   } 
      // catch (err) {
      //     Swal.fire({
      //         icon: 'error',
      //         title: 'Failed!',
      //         text: 'Server error: ' + err,
      //     })
      //     console.error(err);
      // }
      // finally {
      //     hideLoader();
      // }
      


// --------------------------View Patient History -------------------------
async function viewPatientHistory() {
  console.log("viewPatientHistory");
    document.getElementById("view_appointment_history").addEventListener("click", async function (e) {
      e.preventDefault();

      // Store the current edit appointment page + params in history
      window.appHistory.push({
        page: "appointments/edit_appointments",
        params: window.pageParams,
        scrollY: window.scrollY
      });

      const reg_no = document.getElementById("reg_no").value;
      loadPage("appointments/view_appointment_history", {reg_no});
    });
}


  $(document).ready(function() {
    $('.searchable-select').select2({
      placeholder: "Drug Name.....",
      allowClear: true,
      width: '100%'
    });
  });


initEditAppointmentsPage();
setupBMICalculation();
initPrescription();
saveVitals();
EditAppointmentForm();
CancelAppointment();
viewPatientHistory();