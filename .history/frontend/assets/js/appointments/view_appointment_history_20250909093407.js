// // 🕒 Format to "22:37 31/07/2025"
// function formatAppointmentDateTime(input) {
//   const date = new Date(input);

//   const pad = (n) => String(n).padStart(2, '0');

//   const hours = pad(date.getHours());
//   const minutes = pad(date.getMinutes());
//   const day = pad(date.getDate());
//   const month = pad(date.getMonth() + 1); // Months are 0-based
//   const year = date.getFullYear();

//   return `${hours}:${minutes} ${day}/${month}/${year}`;
// }

// // 📅 Format to "31-07-2025"
// function formatReviewDate(input) {
//   const date = new Date(input);

//   const pad = (n) => String(n).padStart(2, '0');

//   const day = pad(date.getDate());
//   const month = pad(date.getMonth() + 1);
//   const year = date.getFullYear();

//   return `${day}-${month}-${year}`;
// }



// // --------------------------Show Prescription PDFFunction-------------------------
// async function getPrescription(appointmentId) {
//   console.log("Generating prescription PDF for appointment ID---:", appointmentId);

//   const regNo = window.pageParams?.reg_no;
//   // console.log("regNo--------->>:", regNo);

//   showLoader();
//    try {
//     const response = await fetch(`/api/v1/appointments/generate_prescription_pdf?appointment_id=${encodeURIComponent(appointmentId)}&reg_no=${encodeURIComponent(regNo)}`);

//     if (response.status === 401) {
//           Swal.fire({
//             icon: 'warning',
//             title: 'Session Expired',
//             text: 'Your session has expired. Please sign in again.',
//           }).then(() => {
//             localStorage.removeItem("token");
//             window.location.href = "/"; // or your login page
//           });
//           return; // stop further processing
//         }

//     if (!response.ok) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: 'PDF generation failed',
//       })
//     }

//     data = await response.json();
//     console.log("Prescription data:", data);

//     if (!data || Object.keys(data).length === 0) {
//       document.querySelector(".prescription-body").innerHTML = "No Appointment History Found";
//       return; // stop further processing
//     }

//     const consultationDatetime = formatAppointmentDateTime(data.AppointmentDateTime);
//     let reviewDatetime = '';  // Define once in a higher scope

//     if (data.ReviewDate) {
//       reviewDatetime = formatReviewDate(data.ReviewDate);
//     }

//     document.querySelector(".prescription-body").innerHTML = "";

//     // Safeguard
//     if (!Array.isArray(data.Prescription)) {
//       console.log("No Prescription data ");
//       data.Prescription = []; // default to empty
//     }
    
//     let prescriptionSectionHTML = '';
//     // Check if prescription list is empty
// if (data.Prescription.length === 0) {
//   prescriptionSectionHTML = `
//     <div class="section">
//       <strong class="rx">Rx</strong>
//       <div class="no-prescription">No Prescriptions Available</div>
//     </div>
//   `;
// } else {
//   const prescriptionTableBody = data.Prescription.map((item, index) => `
//     <tr>
//       <td>${index + 1}</td>
//       <td>
//         ${item.drug}
//         ${item.frequency ? `<br><em class="subtext">${item.frequency}</em>` : ""}
//         ${item.instruction ? `<br><em class="subtext">${item.instruction}</em>` : ""}
//       </td>
//       <td>${item.duration_value} ${item.duration_unit}</td>
//       <td>${item.M ? "✓" : ""}</td>
//       <td>${item.A ? "✓" : ""}</td>
//       <td>${item.E ? "✓" : ""}</td>
//       <td>${item.N ? "✓" : ""}</td>
//       <td>${item["B/F"] ? "✓" : ""}</td>
//       <td>${item["A/F"] ? "✓" : ""}</td>
//     </tr>
//   `).join("");

//   prescriptionSectionHTML = `
//     <div class="section">
//       <strong class="rx">Rx</strong>
//       <table class="rx-table">
//         <thead>
//           <tr>
//             <th>S.No</th>
//             <th>Drug Name</th>
//             <th>Duration</th>
//             <th>M</th>
//             <th>A</th>
//             <th>E</th>
//             <th>N</th>
//             <th>B/F</th>
//             <th>A/F</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${prescriptionTableBody}
//         </tbody>
//       </table>
//     </div>
//   `;
// }

//     // const prescriptionTableBody = data.Prescription.map((item, index) => `
//     //   <tr>
//     //     <td>${index + 1}</td>
//     //     <td>${item.drug}
//     //     ${item.frequency ? `<br>${item.frequency}` : ""}
//     //     ${item.instruction ? `<br>${item.instruction}` : ""}</td>
//     //     <td>${item.duration_value} ${item.duration_unit}</td>
//     //     <td>${item.M ? "✓" : ""}</td>
//     //     <td>${item.A ? "✓" : ""}</td>
//     //     <td>${item.E ? "✓" : ""}</td>
//     //     <td>${item.N ? "✓" : ""}</td>
//     //     <td>${item["B/F"] ? "✓" : ""}</td>
//     //     <td>${item["A/F"] ? "✓" : ""}</td>
//     //   </tr>
//     // `).join("");

//     // --------------------------PDF Template----------------------------------------- 
//     // data.forEach((data, index) => {
//     let prescriptionBodyHTML = `
    
//     <div class="prescription-container">
//         <div class="left-panel">
//             <h5>PROCEDURES</h5>
//             <ul>  
//                 <li>CHEMICAL PEELING<br><span>(for treatment of acne,<br> facial pigmentation and <br> acne scars)</span></li>
//                 <li>ELECTRO CAUTERY & <br>RADIO FREQUENCY<br><span>(for removal of warts,<br>skin tags etc)</span></li>
//                 <li>LASERS<br><span>(hair removal,tattoo<br> removal, pigmentation)</span></li>
//                 <li>DERMA ROLLER /<br> PEN / MNRF<br><span>(for treatment of acne<br>scars)</span></li>
//                 <li>FACIAL<br> REJUVENATION</li>
//                 <li>ANTI AGEING<br><span>(Botox injection, threads<br>lifts)</span></li>
//                 <li>PHOTO THERAPY</li>
//                 <li>PLATELET RICH <br>PLASMA</li>
//                 <li>PUNCH EXCISION<br><span>(for removal of<br> unwanted moles)</span></li>
//                 <li>SCAR REVISION</li>
//                 <li class = "MICRODERMABRASION">MICRODERMABRASION<br><span>(for treatment of acne <br> scars, wrinkles)</span></li>
//                 <li>CRYOTHERAPY<br><span>(for treatment of warts<br>keliods)</span></li>
//             </ul>
//         </div>

//         <div class="right-panel">
//             <div class="right-content">
            
//             <div class="header">
//                 <h1>Dermatology Clinic</h1>
//                 <p>Dr. Nithya D, MD (DVL), DNB<br>
//                    Consultant Dermatologist<br>
//                    Reg. No. 84140</p>
//             </div>
//             <div class="custom-divider"></div>

//             <div class="info-row">
//                 <div><strong>Name:</strong> ${data.FullName || ''}</div>
//                 <div><strong>Date of Consultation:</strong> ${consultationDatetime || ''}</div>
//             </div>
//             <div class="info-row">
//                 <div><strong>Age:</strong> ${data.Age || ''}</div>
//                 <div><strong>Registration No:</strong> ${data.PatientRegistrationNumber || ''}</div>
//             </div>
//             <div class="info-row">
//                 <div><strong>Gender:</strong> ${data.Gender || ''}</div>   
//                 <div><strong>Phone No:</strong> ${data.PhoneNumber || ''}</div>          
//             </div>

//             <div class="page-divider"></div>

//             <div class="vitals">
//                 <span><strong>Weight:</strong> ${data.Weight || ''}kg</span>
//                 <span><strong>Height:</strong> ${data.Height || ''}cm</span>
//                 <span><strong>BMI:</strong> ${data.BMI || ''}kg/m<sup>2</sup></span>
//                 <span><strong>BP:</strong> ${data.BP || ''}mmHg</span>
//                 <span><strong>Pulse:</strong> ${data.Pulse || ''}bpm</span>
//             </div>

//             <div class="page-divider"></div>

//             <div class="section">
//                 <strong>History:</strong>
//                 <p>${ data.History || ''}</p>
//             </div>

//             <div class="page-divider"></div>

//             <div class="section">
//                 <strong>Clinical Features:</strong>
//                 <p>${ data.ClinicalFeature || ''}</p>
//             </div>

//             <div class="section">
//                 <strong>Diagnosis:</strong>
//                 <p>${ data.Diagnosis || ''}</p>
//             </div>

//             <div class="page-divider"></div>

//             <div class="section">
//                 <strong>Investigation:</strong>
//                 <p>${ data.Investigation || ''}</p>
//             </div>

//             <div class="page-divider"></div>

//             <div class="section prescription-table-body">
//               ${prescriptionSectionHTML}
//             </div>

//             </div>
            
//             <!-- footer -->
//              <div class="footer">
//                 <div class="review-date">
//                     Review Date: ${reviewDatetime || ''}
//                 </div>
//                 <div class="doctor-notes">
//                     <strong>Note:</strong>
//                     <p>*If you develop allergies from any medication consult your doctor or near by hospital immediately.<br>
//                     *Kindly bring this prescription record or softcopy of every visit</p>
//                 </div>
//                 <div class="page-divider"></div>
//                 <p class="address">
//                     Clinic: New No 4, 2nd Right on Raja Annamalai Road,Behind Adithya Kanakadhara<br>
//                     Apartment, Saibaba Colony, Coimbatore 641011<br>
//                     Phone: 0422-2439601 / 0422-4707114 * Mob: +91 94878 79601 * Email:<br>
//                     drnithyadhollan@gmail.com * GST: 33ARYPN6845B1ZB
//                 </p>
//                 <div class="page-divider"></div>
//                 <div class="consult-time">
//                     Consulting Time: 10.00 am to 1.00 pm & 3.00 pm to 7.00 pm | Monday to Saturday<br>
//                     [Sunday Holiday]
//                 </div>
//             </div>
//         </div>

//     </div>  
//       `;
//     // });
//     // --------------------------PDF Template End--------------------------
//     // 🔄 Replace card body content
//     // document.querySelector(".prescription-table-body").innerHTML = prescriptionSectionHTML;
//     // <div class="prescription-table-body">${prescriptionSectionHTML}</div>
//     // 🔄 Replace card body content
//     document.querySelector(".prescription-body").innerHTML = prescriptionBodyHTML;
//     // Show the modal (Bootstrap 5)
//     const modal = new bootstrap.Modal(document.getElementById('prescriptionModal'));
//     modal.show();

//   } catch (error) {
//     console.error(error);
//     document.querySelector(".card-body").innerHTML = `<div class="text-danger text-center">❌ ${error.message}</div>`;
//   }finally{
//     hideLoader();
//   }
// } 
  
  
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

// // ----------------- Download PDF Functions ------------------- //
// function downloadPdf() {
//   document.getElementById("downloadPdfBtn").addEventListener("click", function () {
//     const element = document.querySelector(".prescription-body");

//     // Grab the form where appointment_no lives
//     const form = document.querySelector("#appointment_no")?.closest("form");

//     // Get all inputs inside the form
//     const inputs = form?.querySelectorAll("input.form-control.bg-light");

//     // Pick the second input → Full Name
//     const patientName = inputs && inputs[1] ? inputs[1].value : "Patient";

//     const appointmentNumber = document.querySelector("#appointment_no")?.innerText || "Appointment";

//     const safeName = patientName.replace(/[^a-z0-9]/gi, "_");
//     const fileName = `${safeName}_${appointmentNumber}.pdf`;

//     const opt = {
//       // margin: 0,
//       filename: fileName,
//       image: { type: 'jpeg', quality: 0.98 },
//       html2canvas: { scale: 2 , useCORS: true},
//       jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
//       pagebreak: { mode: ['css', 'legacy'] }
//     };

//     html2pdf().set(opt).from(element).save();
//   });
// }

// // ----------------- Print PDF Functions ------------------- //
// function printPdf() {
//   document.getElementById("printPdfBtn").addEventListener("click", function () {
//     const element = document.querySelector(".prescription-body");

//     // Grab the form where appointment_no lives
//     const form = document.querySelector("#appointment_no")?.closest("form");

//     // Get all inputs inside the form
//     const inputs = form?.querySelectorAll("input.form-control.bg-light");

//     // Pick the second input → Full Name
//     const patientName = inputs && inputs[1] ? inputs[1].value : "Patient";

//     const appointmentNumber = document.querySelector("#appointment_no")?.innerText || "Appointment";

//     const safeName = patientName.replace(/[^a-z0-9]/gi, "_");
//     const fileName = `${safeName}_${appointmentNumber}.pdf`;

//     console.log(patientName);
//     console.log(appointmentNumber);
//     console.log(fileName);

//     const opt = {
//       margin: [0.5, 0.5, 0.5, 0.5], // top, left, bottom, right
//       filename: fileName,
//       image: { type: 'jpeg', quality: 0.98 },
//       html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
//       jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
//       pagebreak: { mode: ['css', 'legacy'] }
//     };

//     html2pdf()
//       .set(opt)
//       .from(element)
//       .toPdf()
//       .get('pdf')
//       .then(function (pdf) {
//         pdf.autoPrint();
//         window.open(pdf.output('bloburl'), '_blank');
//       });
//   });
// }


initAppointmentHistory();
// downloadPdf();
// printPdf();



