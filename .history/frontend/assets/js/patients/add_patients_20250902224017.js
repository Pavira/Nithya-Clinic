
// alert("Please fill in all the required fields.");
console.log("add_patients.js loaded");

// ---------------Back Button Functionality ---------------
function initBackButton() {
  document.getElementById("backButton").addEventListener("click", function () {
    loadPage("patients/view_patients");
  });
}
initBackButton();

function initAddPatientPage() {

  // ---------------Date of Birth and Age Calculation ---------------
  document.getElementById("dob").setAttribute("max", new Date().toISOString().split("T")[0]);

  const dobInput = document.getElementById("dob");
  const ageField = document.getElementById("age");

  // alert("Please fill in all the required fields.");

  if (dobInput && ageField) {
    console.log("DOB and Age fields found.");

    dobInput.addEventListener("change", function () {
      console.log("DOB changed:", this.value);

      const dob = new Date(this.value);
      const today = new Date();

      let years = today.getFullYear() - dob.getFullYear();
      let months = today.getMonth() - dob.getMonth();
      let days = today.getDate() - dob.getDate();

      // Adjust months and years if current date is before birthdate this year
      if (months < 0 || (months === 0 && days < 0)) {
        years--;
        months += 12;
      }

      // Recalculate days after adjusting months
      const dobThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      const msInDay = 1000 * 60 * 60 * 24;
      const totalDays = Math.floor((today - dob) / msInDay);

      if (years > 0) {
        ageField.value = `${years} year${years > 1 ? 's' : ''}`;
      } else if (months > 0) {
        ageField.value = `${months} month${months > 1 ? 's' : ''}`;
      } else {
        ageField.value = `${totalDays} day${totalDays !== 1 ? 's' : ''}`;
      }
    });

  } else {
    console.warn("DOB or Age field not found.");
  }

}

//------------ Validate Patient Form -------------
function validatePatientForm() {
  const fullName = document.getElementById("fullName").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const dob = document.getElementById("dob").value;
  const gender = document.querySelector('input[name="gender"]:checked')?.value;
  const marital = document.querySelector('input[name="marital"]:checked')?.value;
  // const ageText = document.getElementById("age").value;  // e.g. "5 years"
  // const age = parseInt(ageText);
  const address = document.getElementById("address").value;
  const profession = document.getElementById("profession").value; 
  const treatment_type = document.getElementById("treatmentType").value;
  const purposeOfVisit = document.getElementById("purposeOfVisit").value;
  const referredBy = document.getElementById("referredBy").value;
  const phonePattern = /^[0-9]{10}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const email = document.getElementById("email").value;
  

  if (!fullName || !phoneNumber || !dob || !gender || !marital || !profession || !treatment_type || !purposeOfVisit) {
    Swal.fire({
      icon: 'warning',
      title: 'Validation',
      text: 'Please fill in all the required fields.',
    });
    // if (!phonePattern.test(phoneNumber)) {
    //   alert("Please enter a valid email and phone number.");
    //   return false;
    // }
    return false;
  }
  if (email && !emailPattern.test(email)) {
    const toast = new bootstrap.Toast(document.getElementById('emailToast'));
    toast.show();
    return false;
  }
  if (phoneNumber && !phonePattern.test(phoneNumber)) {
    const toast = new bootstrap.Toast(document.getElementById('phoneToast'));
    toast.show();
    return false;
  }

  // Additional validation can be added here
  return true;
}

// -----------Check Duplicate Patient -----------
async function checkkDuplicatePatient(fullName, phoneNumber) {
  console.log("Checking for duplicate patient...");

  try {
    const token = localStorage.getItem("token");
    const url = `/api/v1/patients/check_duplicate_patient?full_name=${encodeURIComponent(fullName)}&phone_number=${phoneNumber}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
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
    console.log("Duplicate check result:", result);

    if (response.ok && result.data === true) {
      return false; // Duplicate found
    } else if (response.ok && result.data === false) {
      return true; // No duplicate
    } else {
      Swal.fire({
        icon: 'error',
        title: '⛔ Error checking duplicate patient',
      });
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: '⛔ Server error. Try again later.',
    });
    console.error(err);
  }finally {
    hideLoader(); // Hide the loader
  }
}



// -----------Add Patient Form ----------------
async function initAddPatientForm() {
  
  const patientForm = document.getElementById("add-patient-form");
  if (!patientForm) {
    console.warn("⛔ Form not found!");
    return;
  }
    patientForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // ----------- Validate Form Data -----------
      console.log("Validating patient form...");
      if (!validatePatientForm()) 
        return validatePatientForm();
      console.log("Patient form validated successfully.");

      // ----------- Collect Form Data -----------
      console.log("Collecting patient form data...");
      const fullName = document.getElementById("fullName").value;
      const phoneNumber = document.getElementById("phoneNumber").value;
      const altPhoneNumber = document.getElementById("altPhoneNumber").value;
      const dob = document.getElementById("dob").value;
      const ageText = document.getElementById("age").value;  // e.g. "5 years"
      const age = parseInt(ageText);
      const gender = document.querySelector('input[name="gender"]:checked')?.value;
      const marital = document.querySelector('input[name="marital"]:checked')?.value;

      const address = document.getElementById("address").value;
      const email = document.getElementById("email").value;

      const profession = document.getElementById("profession").value;
      const guardian = document.getElementById("guardian").value;
      const aadhar = document.getElementById("aadhar").value;

      const treatmentType = document.getElementById("treatmentType").value;
      const purposeOfVisit = document.getElementById("purposeOfVisit").value;
      const referredBy = document.getElementById("referredBy").value;
      const user_email = localStorage.getItem("email");
      console.log("User email:####", user_email);

         // Now you can send the form data
      const data = {
        full_name: fullName,
        phone_number : phoneNumber,
        alt_phone_number : altPhoneNumber ? parseInt(altPhoneNumber) : 0,
        dob : dob,
        age : age,
        gender,
        marital_status : marital,
        address,
        email : email ? email : "",
        profession,
        guardian,
        aadhar: aadhar ? parseInt(aadhar) : 0,
        treatment_type: treatmentType,
        purpose_of_visit : purposeOfVisit,
        referred_by : referredBy,
        user : user_email ? user_email : "Unknown",
      };

      console.log("Sending patient data:", data);

      // Show loader while processing
      showLoader();

      // ----------- Check Duplicate Patient -----------
      console.log("Checking for duplicate patient...");
      const isDuplicate = await checkkDuplicatePatient(data.full_name, data.phone_number);
      if (!isDuplicate) {
        hideLoader();
        Swal.fire({
            icon: 'error',
            title: '⛔ Duplicate patient found',
            text: 'Please check the patient details.',
          // }).then(() => {
          // hideLoader(); // Hide the loader
        });       
        return;
      }
      
      try {
        const token = localStorage.getItem("token");
        const response = await fetch('/api/v1/patients/add_patient', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          Swal.fire({
            icon: 'success',
            title: 'Patient created successfully!',
            text: `Patient Registration No.:\n${result.data.id}`,
            confirmButtonText: 'OK',
          }).then(() => {
            // Redirect after user clicks OK
            loadPage("patients/view_patients");
          });       
        } else {
          Swal.fire({
            icon: 'error',
            title: '⛔ Patient creation failed',
            // text: 'Please fill in all the required fields.',
          });
          // alert("⛔ Patient creation failed");
        }
      } catch (err) {
        Swal.fire({
            icon: 'error',
            title: '⛔ Server error. Try again later.',
            // text: 'Please fill in all the required fields.',
          });         
      }
      finally {
          hideLoader(); // Hide the loader
        }
    });
  }

  //Call all init functions
initAddPatientPage();
initAddPatientForm();