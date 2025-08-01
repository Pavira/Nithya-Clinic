
    // ---------------Update Patient Functionality ---------------
    document.getElementById("updateButton").addEventListener("click", async (e) => {
        e.preventDefault(); 

        // ----------- Collect Form Data -----------
        console.log("Collecting patient form data...");
        const fullName = document.getElementById("fullName").value;
        const phoneNumber = document.getElementById("phoneNumber").value;
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
        const aadhar = document.getElementById("aadhar").value;

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
            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: `Patient ${updateResult.data.FullName} updated successfully.`,
                showConfirmButton: false,
                timer: 1500
            }).then(loadPage("patients/view_patients"));
            
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

    // Fill the form
    document.getElementById("patientId").value = patient.PatientRegistrationNumber === null ? "" : patient.PatientRegistrationNumber;
    document.getElementById("fullName").value = patient.FullName === null ? "" : patient.FullName;
    document.getElementById("phoneNumber").value = patient.PhoneNumber === null ? "" : patient.PhoneNumber;
    document.getElementById("altPhoneNumber").value = patient.AlternatePhoneNumber === 0 ? "" : patient.AlternatePhoneNumber;
    document.getElementById("aadhar").value = patient.AadharNumber === "" ? "" : patient.AadharNumber;
    // document.getElementById("dob").value = patient.DOB;
    document.getElementById("dob").value = patient.DOB.split("T")[0]; // Sets value as "2025-07-01"
    document.getElementById("age").value = patient.Age;
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

initEditPatientsPage();