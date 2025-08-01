// -----------Retrieve Prescription Table details helper function ----------------
function getPrescriptionTableData() {
    const tableData = [];
    const rows = document.querySelectorAll('#prescription-table tbody tr');

    if (rows.length === 0) {
        return tableData;
    }
    rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        const serial = parseInt(cells[0].innerText.trim());
        const drug = cells[1].innerText.trim();
        const dosage = cells[2].innerText.trim();

        // Extract timing badges
        const timingBadges = Array.from(cells[3].querySelectorAll('.badge')).map(badge => badge.innerText.trim());
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
            drug,
            dosage,
            ...timingFlags
        });
    });

    return tableData;
}


// -----------Edit Appointment Form ----------------
async function EditAppointmentForm() {
  
  const editAppointmentForm = document.getElementById("closeAppointment");
  if (!editAppointmentForm) {
    console.warn("⛔ Form not found!");
    return;
  }
    editAppointmentForm.addEventListener("click", async function (e) {
      e.preventDefault();


      // ----------- Collect Form Data -----------
      console.log("Collecting appointment form data...");
      const reg_no = document.getElementById("reg_no").value;
      const fullName = document.getElementById("full_name").value;
      const consultationCategory = document.getElementById("consultation_category").value;
      const appointmentCategory = document.getElementById("appointment_category").value;
      const description = document.getElementById("description").value;
    //   const startDateTime = document.getElementById("start_datetime").value;
      const height = parseFloat(document.getElementById("height").value) || 0;
      const weight = parseFloat(document.getElementById("weight").value) || 0;
      const bmi = parseFloat(document.getElementById("bmi").value) || 0;
      const blood_pressure = parseFloat(document.getElementById("blood_pressure").value) || 0;
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

      if(!consultationCategory || !appointmentCategory || description === ""){
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

      console.log("Sending appointment data:", data);
      console.log("Appointment id:", window.pageParams?.appointment_id);

      const user = window.pageParams?.user;

      // Show loader while processing
      showLoader();      
      try {
        const token = localStorage.getItem("token");
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

    const drug = document.getElementById('drug_name').value.trim();
    const dosage = document.getElementById('dosage').value.trim();
    if (!drug || !dosage) {
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
        dosage,
        ...timingFlags,
    };

    prescriptionList.push(prescriptionItem);
    updatePrescriptionTable();
    resetPrescriptionForm();
    });

    function resetPrescriptionForm() {
       // Reset Select2 dropdown (drug name)
      $('#drug_name').val(null).trigger('change');
      document.getElementById('dosage').value = '';
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
              <td>${item.dosage}</td>
              <td>${timingDisplay || '<em>No Timing</em>'}</td>
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

    document.getElementById("save_vitals").addEventListener("click", async function (e) {
      e.preventDefault();

      // ----------- Collect Form Data -----------
        console.log("Collecting vitals form data...");
        const height = parseFloat(document.getElementById("height").value) || 0;
        const weight = parseFloat(document.getElementById("weight").value) || 0;
        const bmi = parseFloat(document.getElementById("bmi").value) || 0;
        const blood_pressure = parseFloat(document.getElementById("blood_pressure").value) || 0;
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

      console.log("Sending vitals data:", data);

      // Show loader while processing
      showLoader();      
      try {
        const token = localStorage.getItem("token");
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

  try {
    const token = localStorage.getItem("token");
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
    console.log("Fetched vitals data:", result);
    return result.data.vitals;
    
    } catch (err) {
        // alert("Server error. Try again later.");
        console.error(err);
    }
}

// ------------------Cancel Appointment ------------------
async function CancelAppointment() {

    document.getElementById("cancelAppointment").addEventListener("click", async function (e) {
      e.preventDefault();
      const fullName = document.getElementById("full_name").value;
      // ----------- Collect Form Data -----------
      showLoader();      
      try {
        const token = localStorage.getItem("token");
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

// ------------------Init Edit Appointments Page ------------------
async function initEditAppointmentsPage() {

    showLoader();   

    try {
        console.log("Appointment ID:-"+ window.pageParams?.appointment_id);

        // ----------Fetch Vitals Data----------
        const vitals = await fetchVitalsData();        

        // ----------Function For Closed Appointment----------
        const appointment_status = vitals.AppointmentStatus;
        const doctor_fees = vitals.DoctorFees;
        const review_datetime = vitals.ReviewDate;
        if(!review_datetime || review_datetime === null || review_datetime === undefined) {
            document.getElementById("review_datetime").value = '';
        }
        console.log("Review Date:-"+ review_datetime);
        const prescription = vitals.Prescription;
        console.log("Prescription:-"+ prescription);
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
          document.getElementById("dosage").style.display = 'none';
          document.getElementById("timing_label").style.display = 'none';
          document.getElementById("timing-buttons").style.display = 'none';         
          document.getElementById("drug_name_label").style.display = 'none';
          document.getElementById("dosage_label").style.display = 'none';
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
            document.getElementById("dosage").style.display = 'none';
            document.getElementById("timing_label").style.display = 'none';
            document.getElementById("timing-buttons").style.display = 'none';         
            document.getElementById("drug_name_label").style.display = 'none';
            document.getElementById("dosage_label").style.display = 'none';
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
              <td>${item.dosage}</td>
              <td>${timings.join(", ")}</td>
              <td>"N/A"</td>
            </tr>
          `;
        }).join("");

        document.getElementById("prescription-table-body").innerHTML = prescriptionTableBody;
            }
        
        // ----------Function For Cancel Appointment End----------

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

// --------------------------View Patient History -------------------------
async function viewPatientHistory() {
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