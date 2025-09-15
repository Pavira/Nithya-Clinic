    //------------ Validate Patient Form -------------
function validatePatientForm() {
  const fullName = document.getElementById("fullName").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const dob = document.getElementById("dob").value;
  const gender = document.querySelector('input[name="gender"]:checked')?.value;
  const marital = document.querySelector('input[name="martial"]:checked')?.value;
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
  const aadharNumber = document.getElementById("aadhar").value;
  const aadharPattern = /^[0-9]{12}$/;
  

  if (!fullName || !phoneNumber || !dob || !gender || !marital || !treatment_type || !purposeOfVisit) {
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
    
    // Swal.fire({
    //   icon: 'warning',
    //   title: 'Validation',
    //   text: 'Please enter a valid email address.',
    // });
    return false;
  }
  if (phoneNumber && !phonePattern.test(phoneNumber)) {
    // const toast = new bootstrap.Toast(document.getElementById('phoneToast'));
    // toast.show();
    Swal.fire({
      icon: 'warning',
      title: 'Validation',
      text: 'Please enter a valid 10-digit phone number.',
    });
    return false;
  }
  if (aadharNumber && !aadharPattern.test(aadharNumber)) {
    // const toast = new bootstrap.Toast(document.getElementById('phoneToast'));
    // toast.show();
    Swal.fire({
      icon: 'warning',
      title: 'Validation',
      text: 'Please enter a valid 12-digit Aadhar number.',
    });
    return false;
  }


  // Additional validation can be added here
  return true;
}

// -----------Check Duplicate Patient -----------
async function checkkDuplicatePatient(fullName, phoneNumber) {
  console.log("Checking for duplicate patient...");
  showLoader();
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
  } finally {
    hideLoader(); // Hide the loader
  }
}


    // ---------------Update Patient Functionality ---------------
    document.getElementById("updateButton").addEventListener("click", async (e) => {
        e.preventDefault(); 

        // ----------- Validate Form Data -----------
        console.log("Validating patient form...");
        if (!validatePatientForm()) 
            return validatePatientForm();

        const fullName = document.getElementById("fullName").value.trim().toUpperCase();
      
        const phoneNumber = document.getElementById("phoneNumber").value;
        
        // ----------- Check Duplicate Patient -----------
        console.log("Checking for duplicate patient...");
        const isDuplicate = await checkDuplicatePatient(fullName, phoneNumber);
        if (!isDuplicate) {
          hideLoader();
          Swal.fire({
              icon: 'error',
              title: '⛔ Duplicate patient found',
              text: 'A patient with the same name and phone number already exists.',
            // }).then(() => {
            // hideLoader(); // Hide the loader
          });       
          return;
        }
          
        // ----------- Collect Form Data -----------
        console.log("Collecting patient form data...");
        
        const altPhoneNumber = document.getElementById("altPhoneNumber").value;
        const dob = document.getElementById("dob").value;
        const ageText = document.getElementById("age").value;  // e.g. "5 years"
        const age = parseInt(ageText);
        const gender = document.querySelector('input[name="gender"]:checked')?.value;
        const marital = document.querySelector('input[name="martial"]:checked')?.value;

        const address = document.getElementById("address").value;
        const email = document.getElementById("email").value;

        const profession = document.getElementById("profession").value;
        const guardian = document.getElementById("guardian").value;
        const aadhar = document.getElementById("aadhar").value == "" ? 0 : parseInt(document.getElementById("aadhar").value);

        const treatmentType = document.getElementById("treatmentType").value;
        const purposeOfVisit = document.getElementById("purposeOfVisit").value;
        const referredBy = document.getElementById("referredBy").value;

            // Now you can send the form data
        const updatedPatient = {
            full_name: fullName,
            phone_number : phoneNumber,
            alt_phone_number : altPhoneNumber ? parseInt(altPhoneNumber) : 0,
            dob : dob,
            age : age,
            gender,
            marital_status : marital,
            address,
            email : email ? email : null,
            profession,
            guardian,
            aadhar,
            treatment_type: treatmentType,
            purpose_of_visit : purposeOfVisit,
            referred_by : referredBy
        };

        const patientId = window.pageParams?.patient_id;

        const token = localStorage.getItem("token");

        showLoader();

        try{
            const updateRes = await fetch(`/api/v1/patients/${patientId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(updatedPatient)
            });

        const updateResult = await updateRes.json();

        if (updateRes.ok && updateResult.success) {
            hideLoader();
            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: `Patient ${updateResult.data.FullName} updated successfully.`,
                confirmButtonText: 'OK',
          }).then(() => {
            // Redirect after user clicks OK
            loadPage("patients/view_patients");
          });
            
        } else {
            alert("❌ Failed to update user: " + updateResult.message);
        }
        }catch(err){
            alert("Server error. Try again later.");
            console.error(err);
        }finally{
            hideLoader();
        }
    });

    // ---------------Delete User Functionality ---------------
    document.getElementById("deleteButton").addEventListener("click", async (e) => {
        e.preventDefault();

        const patientId = window.pageParams?.patient_id;
        const token = localStorage.getItem("token");

        showLoader();
        try {
            Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
            }).then(async (result) => {

            showLoader();
            try {
                if (result.isConfirmed) {
                const deleteRes = await fetch(`/api/v1/patients/${patientId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                });

                const deleteResult = await deleteRes.json();

                if (deleteRes.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Patient has been deleted successfully.',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    loadPage("patients/view_patients");
                })
                } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed!',
                    text: 'Failed to delete patient: ' + deleteResult.message,
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    loadPage("patients/view_patients");
                })            
                }
            }              
            } catch (error) {
                alert("Server error. Try again later.");
                console.error(error);                
            }finally{
                hideLoader();
            }
            });
            
        } catch (error) {
                alert("Server error. Try again later.");
                console.error(error);
        } finally {
                hideLoader();
            
        }
    });

async function formatDateToReadable(dateString) {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options); // Output: "7 July 2025"
}

async function initEditPatientsPage() {
    const patientId = window.pageParams?.patient_id;
    console.log(patientId);

    if (!patientId) {
        console.error("No user selected");
        return;
    }

    const token = localStorage.getItem("token");

    showLoader();
    
    try {
        // Fetch user data
    const res = await fetch(`/api/v1/patients/${patientId}`, {
        method: "GET",
        headers: {
        "Authorization": `Bearer ${token}`,
        }
    });
    if (res.status === 401) {
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

    const result = await res.json();
    const patient = result.data;

    // based on DOB calculate age and fill the age field
    const dobString = patient.DOB; // "2025-05-07T00:00:00+00:00"
const ageField = document.getElementById("age");

if (dobString && ageField) {
  console.log("DOB and Age field found.");

  const dob = new Date(dobString);
  const today = new Date();

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  // Adjust months and years if current date is before birthdate this year
  if (months < 0 || (months === 0 && days < 0)) {
    years--;
    months += 12;
  }

  // Recalculate days difference
  const msInDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.floor((today - dob) / msInDay);

  // Decide display
  if (years > 0) {
    ageField.value = `${years} year${years > 1 ? "s" : ""}`;
  } else if (months > 0) {
    ageField.value = `${months} month${months > 1 ? "s" : ""}`;
  } else {
    ageField.value = `${totalDays} day${totalDays !== 1 ? "s" : ""}`;
  }
} else {
  console.warn("DOB or Age field not found.");
}


    // Fill the form
    document.getElementById("patientId").value = patient.PatientRegistrationNumber === null ? "" : patient.PatientRegistrationNumber;
    document.getElementById("fullName").value = patient.FullName === null ? "" : patient.FullName;
    document.getElementById("phoneNumber").value = patient.PhoneNumber === null ? "" : patient.PhoneNumber;
    document.getElementById("altPhoneNumber").value = patient.AlternatePhoneNumber === 0 ? "" : patient.AlternatePhoneNumber;
    document.getElementById("aadhar").value = patient.AadharNumber === 0 ? "" : patient.AadharNumber;
    // document.getElementById("dob").value = patient.DOB;
    document.getElementById("dob").value = patient.DOB.split("T")[0]; // Sets value as "2025-07-01"
    // document.getElementById("age").value = patient.Age;
    const genderRadio = document.querySelector(`input[name="gender"][value="${patient.Gender}"]`);
    if (genderRadio) genderRadio.checked = true;
    // console.log(patient.MaritialStatus);
    const maritalRadio = document.querySelector(`input[name="martial"][value="${patient.MaritialStatus}"]`);
    if (maritalRadio) maritalRadio.checked = true;
    document.getElementById("address").value = patient.Address === "" ? "" : patient.Address;
    document.getElementById("email").value = patient.EmailAddress === "" ? "" : patient.EmailAddress;
    document.getElementById("profession").value = patient.Profession === "" ? "" : patient.Profession;
    document.getElementById("treatmentType").value = patient.PatientType === "" ? "" : patient.PatientType;
    document.getElementById("purposeOfVisit").value = patient.PurposeOfVisit === "" ? "" : patient.PurposeOfVisit;
    document.getElementById("referredBy").value = patient.ReferredBy === "" ? "" : patient.ReferredBy;
    document.getElementById("guardian").value = patient.GuardianName === "" ? "" : patient.GuardianName;

    const logDateTime = patient.LogDateTime; // e.g. "2025-07-10T13:06:57.407608+00:00"
    const userName = patient.User || "Unknown"; // Replace with actual field if different
    console.log("patient.User===:", patient.User);

    const formattedDate = await formatDateToReadable(logDateTime);
    const registrationInfo = `This Registration was done on ${formattedDate} by ${userName}`;

    document.getElementById("registration-info").textContent = registrationInfo;


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


  // checking duplicate name and phone number while typing
  document.getElementById("fullName").addEventListener("blur", async function () {
    const fullName = this.value.trim().toUpperCase();
    const testpatientName = window.pageParams.patient_name;
    
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    if (fullName != testpatientName  && phoneNumber.length === 10) {  
      // showLoader();
      const isDuplicate = await checkDuplicatePatient(fullName, phoneNumber);
      if (!isDuplicate) {
        hideLoader();
        Swal.fire({
          icon: 'warning',
          title: '⛔ Duplicate patient found',
          text: 'A patient with the same name and phone number already exists.',
        });
      }
    }
  });

  document.getElementById("phoneNumber").addEventListener("input", async function () {
    const fullName = document.getElementById("fullName").value.trim().toUpperCase();
    // const patientId =  document.getElementById("patientId").value;
    const phoneNumber = this.value.trim();
    if (fullName && phoneNumber.length === 10) {  
      // showLoader();
      const isDuplicate = await checkDuplicatePatient(fullName, phoneNumber);
      if (!isDuplicate) {
        hideLoader();
        Swal.fire({
          icon: 'warning',
          title: '⛔ Duplicate patient found',
          text: 'A patient with the same name and phone number already exists.',
        });
      }
    }
  });  

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

// initEditPatientsPage();
window.initEditPatientsPage = initEditPatientsPage;