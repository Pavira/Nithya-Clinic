// Load reusable components (navbar, sidebar, footer)
function loadComponent(id, path) {
  fetch(`/admin/components/${path}`)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;

      if (id === "navbar") {
        const displayName = localStorage.getItem("display_name") || "User";
        const displaySpan = document.getElementById("display_name");
        console.log("Display name: " + displayName);
        if (displaySpan) {
          displaySpan.textContent = displayName;
        }
      }
      if(id === "sidebar") {
        const userRole = localStorage.getItem("user_role");  
        // console.log("User role: " + userRole);
        const navUserMgmt = document.getElementById("nav-usermanagement-view_users");
        if (userRole !== "Admin" && navUserMgmt) {
          // console.log("test---------: " + userRole); 
          navUserMgmt.style.display = "none";  // 👈 Hide User Management
        }
      }
    });
}

// Global variable to hold page parameters
window.pageParams = {};
window.appHistory = window.appHistory || [];
// Load a page into the main content area
function loadPage(relativePath, params = {}) {
  console.log("Loading page:", relativePath); // Add this

  window.pageParams = params; // Save params globally
  // Save the current page before overwriting
  window.currentPage = relativePath;


  fetch(`/admin/pages/${relativePath}.html`)
    .then(res => res.text())
    .then(html => {
      const pageBody = document.getElementById("page-body");
      if (pageBody) {
        pageBody.innerHTML = html;
      }

      const pageKey = relativePath.split("/")[0];  // just 'dashboard' or 'patients'

      highlightActiveNav(relativePath);
      setHeaderFromMetadataOrMap(relativePath, pageKey);

      //-------------------------Dashboard scripts--------------------------
      if (relativePath === "dashboard/dashboard") {
        const display_name = localStorage.getItem("display_name");
        const showName = `<span style="font-weight: bold; color: #6f42c1; font-style: italic">Hello ${display_name}!</span>`;
        const img_url = "/admin/assets/images/doctor.jpg";
        setPageHeader(" ", showName, "Overview of Out Patients and OP Procedure",img_url);
        loadScriptOnce("/admin/assets/js/dashboard/dashboard.js");
         const userRole = localStorage.getItem("user_role");  
        // console.log("User role: " + userRole);
        const navUserMgmt = document.getElementById("nav-usermanagement-view_users");
        if (userRole !== "Admin" && navUserMgmt) {
          console.log("test---------: " + userRole); 
          document.getElementById("op-revenue").style.display = "none"; // Hide total revenue
          document.getElementById("op-procedures-revenue").style.display = "none";
          document.getElementById("total-revenue").style.display = "none"; // Hide total patients
        }

        
      }

      //-------------------------Patients scripts--------------------------
      if (relativePath === "patients/add_patients") {
        // loadStyleOnce("admin/assets/css/patients/add_patients.css");
        loadScriptOnce("/admin/assets/js/patients/add_patients.js");
      }
      if (relativePath === "patients/view_patients") {
        if (window.currentPage && window.currentPage !== "appointments/edit_appointments") {
            window.appHistory.push({
            page: window.currentPage,
            params: window.pageParams || {},
            scrollY: window.scrollY
          });
        }

        loadScriptOnce("/admin/assets/js/patients/view_patients.js", () => {
          if (typeof initViewPatientsPage === "function") {
            initViewPatientsPage(); // ✅ Safe call
          }
        });
      }
      if (relativePath === "patients/edit_patients") {
        loadScriptOnce("/admin/assets/js/patients/edit_patients.js", () => {
          if (typeof initEditPatientsPage === "function") {
            initEditPatientsPage(); // ✅ Safe call
          }
        });
      }
      
      //-------------------------Appointments scripts--------------------------
      if (relativePath === "appointments/add_appointments") {
        // loadStyleOnce("admin/assets/css/appointments/add_appointments.css");
        loadScriptOnce("/admin/assets/js/appointments/add_appointments.js", () => {
          if (typeof initAddAppointmentsPage === "function") {
            initAddAppointmentsPage(); // ✅ Safe call
          }
        });
      }
      if (relativePath === "appointments/edit_appointments") {
        // Save history only if we're coming from another page
        // if (window.currentPage && window.currentPage !== "appointments/edit_appointments") {
        //   window.appHistory.push({
        //     page: window.currentPage,
        //     params: window.pageParams || {},
        //     scrollY: window.scrollY
        //   });
        // }
        // // Save current page
        // window.currentPage = relativePath;
        loadScriptOnce("/admin/assets/js/appointments/edit_appointments.js", () => {
          if (typeof initEditAppointmentsPage === "function") {
            initEditAppointmentsPage(); // ✅ Safe call
          }
        });
      }
      
      if (relativePath === "appointments/view_appointment_history") {
        if (window.currentPage && window.currentPage !== "appointments/edit_appointments") {
          window.appHistory.push({
            page: window.currentPage,
            params: window.pageParams || {},
            scrollY: window.scrollY
          });
        }

        // loadStyleOnce("admin/assets/css/appointments/view_appointment_history.css");
        loadScriptOnce("/admin/assets/js/appointments/view_appointment_history.js", () => {
          if (typeof initAppointmentHistory === "function") {
            initAppointmentHistory(); // ✅ Safe call
          }
        });
      }
      if (relativePath === "appointments/view_appointments") {
        // loadStyleOnce("admin/assets/css/appointments/add_appointments.css");
        loadScriptOnce("/admin/assets/js/appointments/view_appointments.js", () => {
          if (typeof initViewAppointmentsPage === "function") {
            initViewAppointmentsPage(); // ✅ Safe call
          }
        });
      }

      //-------------------------Users scripts-------------------------
      if (relativePath === "usermanagement/edit_users") {
        // loadStyleOnce("admin/assets/css/usermanagement/add_users.css");
        loadScriptOnce("/admin/assets/js/usermanagement/edit_users.js", () => {
          if (typeof initEditUsersPage === "function") {
            initEditUsersPage(); // ✅ Safe call
          }
        });
        }

      if (relativePath === "usermanagement/add_users") {
        // loadStyleOnce("admin/assets/css/patients/add_users.css");
        loadScriptOnce("/admin/assets/js/usermanagement/add_users.js");
      }
      if (relativePath === "usermanagement/view_users") {
        // loadStyleOnce("admin/assets/css/usermanagement/add_users.css");
        loadScriptOnce("/admin/assets/js/usermanagement/view_users.js", () => {
          if (typeof initViewUsersPage === "function") {
            initUserManagementPage(); // ✅ Safe call 
          }
        });
      }
      // -------------------------Drugs scripts-------------------------
      if (relativePath === "drug_names/add_drug_names") {
        // loadStyleOnce("admin/assets/css/drugs/add_drugs.css"); 
        loadScriptOnce("/admin/assets/js/drug_names/add_drug_names.js", () => {
          if (typeof initAddDrugsPage === "function") {
            initAddDrugsPage(); // ✅ Safe call
          }
        });
      }
      if (relativePath === "drug_names/edit_drug_names") {
        // loadStyleOnce("admin/assets/css/drugs/edit_drugs.css");
        loadScriptOnce("/admin/assets/js/drug_names/edit_drug_names.js", () => {
          if (typeof initEditDrugsPage === "function") {
            initEditDrugsPage(); // ✅ Safe call
          }
        });
      }
      if (relativePath === "drug_names/view_drug_names") {
        // loadStyleOnce("admin/assets/css/drugs/view_drugs.css");
        loadScriptOnce("/admin/assets/js/drug_names/view_drug_names.js", () => {
          if (typeof initViewDrugsPage === "function") {
            initViewDrugsPage(); // ✅ Safe call
          }
        });
      }
      // -------------------------Drug Category scripts-------------------------
      if (relativePath === "drug_category/add_drug_category") {
        // loadStyleOnce("admin/assets/css/drugcategory/add_drug_category.css");
        loadScriptOnce('/admin/assets/js/drug_category/add_drug_category.js', () => {
          if (typeof initAddDrugCategoryPage === 'function') {
            initAddDrugCategoryPage();
          }
        });
      }
      if (relativePath === "drug_category/edit_drug_category") {
        // loadStyleOnce("admin/assets/css/drugcategory/edit_drug_category.css");
        loadScriptOnce("/admin/assets/js/drug_category/edit_drug_category.js", () => {
          if (typeof initEditDrugCategoryPage === "function") {
            initEditDrugCategoryPage(); // ✅ Safe call
          }
        });
      }
      if (relativePath === "drug_category/view_drug_category") {
        // loadStyleOnce("admin/assets/css/drugcategory/view_drug_category.css");
        loadScriptOnce("/admin/assets/js/drug_category/view_drug_category.js", () => {
          if (typeof initViewDrugCategoryPage === "function") {
            initViewDrugCategoryPage(); // ✅ Safe call
          }
        });
      }


    });
}

// Highlight the active link in sidebar
function highlightActiveNav(pagePath) {
  const navLinks = document.querySelectorAll("#sidebar .nav-link");
  navLinks.forEach(link => link.classList.remove("active"));

  const navId = "nav-" + pagePath.replace(/\//g, "-");
  const activeLink = document.getElementById(navId);
  if (activeLink) activeLink.classList.add("active");
}

// Handle both default page header map and custom page metadata
function setHeaderFromMetadataOrMap(path, key) {
  // alert("Setting header for path: " + path); // Debugging line
  const meta = document.getElementById("page-header-data");
  if (meta) {
    // Custom page-level metadata (like add_patient)
    // console.log("Using custom metadata for header:", meta);
    const icon = meta.dataset.icon || "file-earmark-text";
    const title = meta.dataset.title || "Untitled Page";
    const subtitle = meta.dataset.subtitle || "";
    setPageHeader(icon, title, subtitle);
  } else {
    // Use predefined map
    // updatePageHeader(key);
  }
}

// Render page header
function setPageHeader(icon, title, subtitle = "",bgImage = "") {
  const header = document.getElementById("page-header");
  // console.log("Setting page header with icon: " + icon + ", title: " + title); // Debugging line
  if (header) {
  //   const backgroundStyle = bgImage
  //     ? `style="
  //     background-image: url('${bgImage}');
  //     background-size: contain;              /* smaller image */
  //     background-position: right center;      /* shift to left */
  //     background-repeat: no-repeat;
  //     border-radius: 10px;
  //     padding: 0;          /* extra left padding to make room for image */
  //     min-height: 80px;"`                   /* control height */
  // : "";

    header.innerHTML = `
      <div>
        <h2 class="mb-1 d-flex align-items-center">
          <i class="bi bi-${icon} me-2 fs-4"></i> ${title}
        </h2>
        ${subtitle ? `<p class="text-muted small mb-0 ms-4">${subtitle}</p>` : ""}
      </div>
    `;
  }
}

// Insert reusable components like search bar
function insertComponent(targetId, componentPath) {
  fetch(`/admin/components/${componentPath}`)
    .then(res => res.text())
    .then(html => {
      document.getElementById(targetId).innerHTML = html;
    })
    .catch(error => {
      console.error("Error loading component:", error);
    });
}

// Add listeners for dynamic nav links
// function attachNavLinkListeners() {
//   const links = document.querySelectorAll(".nav-link-load");
//   links.forEach(link => {
//     link.addEventListener("click", (e) => {
//       e.preventDefault();
//       const page = link.getAttribute("data-page");
//       if (page) {
//         loadPage(page);
//       }
//     });
//   });
// }

// Add this global click handler in main.js
document.addEventListener("click", function (e) {
  const target = e.target.closest(".nav-link-load");
  if (target) {
    e.preventDefault();
    const page = target.getAttribute("data-page");
    // console.log("Clicked page:", page);
    if (page) {
      loadPage(page);
    }
  }
});

// function loadScriptOnce(src, callback) {
//   // If script already added
//   if (document.querySelector(`script[src="${src}"]`)) {
//     // console.log("Script already exists:", src);
//     if (callback) callback();
//     return;
//   }

//   const script = document.createElement("script");
//   script.src = src;
//   script.onload = () => {
//     console.log("Script loaded:", src);
//     if (callback) callback();
//   };
//   script.onerror = () => {
//     console.error("Error loading script:", src);
//   };

//   document.body.appendChild(script);
// }
function loadScriptOnce(src, callback) {
  console.log("Loading script:", src);
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) existing.remove(); // Remove old one

  const script = document.createElement("script");
  script.src = src;
  script.defer = true; // <-- Ensures execution after DOM is parsed
  script.onload = () => {
    console.log("Script reloaded:", src);
    if (callback) callback();
  };
  script.onerror = () => {
    console.error("Failed to reload:", src);
  };
  document.body.appendChild(script);
}



// Load styles only for particular pages
function loadStyleOnce(href) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}

function loadLayoutComponents() {
  loadComponent("navbar", "navbar.html");
  loadComponent("sidebar", "sidebar.html");
  loadComponent("footer", "footer.html");

  const pageHeader = document.getElementById("page-header");
  if (!pageHeader) {
    const headerDiv = document.createElement("div");
    headerDiv.id = "page-header";
    headerDiv.className = "page-header d-flex justify-content-between align-items-center mb-3";
    document.getElementById("main-content").prepend(headerDiv);
  }
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (e) {
    return true;
  }
}

//---------Loader Functionality---------
// function showLoader() {
//   document.getElementById("global-loader").classList.remove("d-none");
// }

// function hideLoader() {
//   document.getElementById("global-loader").classList.add("d-none");
// }

function showLoader() {
  document.getElementById("loader-overlay").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader-overlay").style.display = "none";
}


//----------Loader Functionality End---------

// On page load
window.onload = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("No valid token found. Redirecting to sign-in page.");
    // localStorage.removeItem("token");
    // window.location.href = "/"; // or your login page
    // localStorage.removeItem("token");
    // loadPage("auth/signin");
    return;
  } 
  // else if (isTokenExpired(token)) {
  //   Swal.fire({
  //     icon: 'warning',
  //     title: 'Session Expired',
  //     text: 'Your session has expired. Please sign in again.',
  //   }).then(() => {
  //     localStorage.removeItem("token");
  //     window.location.href = "/"; // or your login page
  //   });
  // }
  else {
    loadLayoutComponents();
    loadPage("dashboard/dashboard");
    console.log("testing");
  }
};

document.getElementById("confirmLogoutBtn").addEventListener("click", function () {
  // Clear local/session storage or tokens if needed
  sessionStorage.clear();
  localStorage.clear();

  // Optionally: Call logout API or Firebase signOut

  // Redirect to login page
  window.location.href = "/admin/pages/auth/signin.html";
});

// --------------------------Show Prescription PDFFunction-------------------------

// 🕒 Format to "22:37 31/07/2025"
function formatAppointmentDateTime(input) {
  const date = new Date(input);

  const pad = (n) => String(n).padStart(2, '0');

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1); // Months are 0-based
  const year = date.getFullYear();

  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

// 📅 Format to "31-07-2025"
function formatReviewDate(input) {
  const date = new Date(input);

  const pad = (n) => String(n).padStart(2, '0');

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

async function getPrescription(appointmentId, regNo) {
  console.log("Generating prescription PDF for appointment ID---:", appointmentId);

  // const regNo = window.pageParams?.reg_no;
  // console.log("regNo--------->>:", regNo);

  showLoader();
   try {
    const response = await fetch(`/api/v1/appointments/generate_prescription_pdf?appointment_id=${encodeURIComponent(appointmentId)}&reg_no=${encodeURIComponent(regNo)}`);

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

    if (!response.ok) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'PDF generation failed',
      })
    }

    data = await response.json();
    console.log("Prescription data:", data);

    if (!data || Object.keys(data).length === 0) {
      document.querySelector(".prescription-body").innerHTML = "No Appointment History Found";
      return; // stop further processing
    }

    const consultationDatetime = formatAppointmentDateTime(data.AppointmentDateTime);
    let reviewDatetime = '';  // Define once in a higher scope

    if (data.ReviewDate) {
      reviewDatetime = formatReviewDate(data.ReviewDate);
    }

    document.querySelector(".prescription-body").innerHTML = "";

    // Safeguard
    if (!Array.isArray(data.Prescription)) {
      console.log("No Prescription data ");
      data.Prescription = []; // default to empty
    }
    
    let prescriptionSectionHTML = '';
    // Check if prescription list is empty
if (data.Prescription.length === 0) {
  prescriptionSectionHTML = `
    <div class="section">
      <strong class="rx">Rx</strong>
      <div class="no-prescription">No Prescriptions Available</div>
    </div>
  `;
} else {
  const prescriptionTableBody = data.Prescription.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>
        ${item.drug}
        ${item.instruction ? `<br><em class="subtext">${item.instruction}</em>` : ""}
      </td>
      <td>${item.duration_value} ${item.duration_unit}</td>
      <td>${item.M ? item.M : ""}</td>
      <td>${item.A ? item.A : ""}</td>
      <td>${item.E ? item.E : ""}</td>
      <td>${item.N ? item.N : ""}</td>
      <td>${item["B/F"] == 1 ? "✓" : ""}</td>
      <td>${item["A/F"] == 1 ? "✓" : ""}</td>
    </tr>
  `).join("");

  prescriptionSectionHTML = `
    <div class="section">
      <strong class="rx">Rx</strong>
      <table class="rx-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Drug Name</th>
            <th>Duration</th>
            <th>M</th>
            <th>A</th>
            <th>E</th>
            <th>N</th>
            <th>B/F</th>
            <th>A/F</th>
          </tr>
        </thead>
        <tbody>
          ${prescriptionTableBody}
        </tbody>
      </table>
    </div>
  `;
}

function renderSection(label, value) {
  if (!value || value.trim() === "") return ""; // skip if empty
  return `<div class="section"><strong>${label}:</strong> ${value}</div>`;
}

// based on DOB calculate age and fill the age field
const dobString = data.DOB; // "2025-05-07T00:00:00+00:00"
let ageField = "";

if (dobString ) {
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
    ageField = `${years} year${years > 1 ? "s" : ""}`;
  } else if (months > 0) {
    ageField = `${months} month${months > 1 ? "s" : ""}`;
  } else {
    ageField = `${totalDays} day${totalDays !== 1 ? "s" : ""}`;
  }
} else {
  console.warn("DOB or Age field not found.");
}

    // --------------------------PDF Template----------------------------------------- 
    // data.forEach((data, index) => {
    let prescriptionBodyHTML = `
    
    <div class="prescription-container">
      <div class="top-panel">
    <!-- 🔥 Two sections: left-info and right-info -->
    <div class="top-left">
        <h1>Dermatology Clinic</h1>
        <p class="address">
            Clinic: New No 4, 2nd Right on Raja Annamalai Road, Behind Adithya Kanakadhara Apartment, Saibaba Colony, Coimbatore 641011<br>
            Phone: 0422-2439601 / 0422-4707114 * Mob: +91 94878 79601 * Email: drnithyadhollan@gmail.com * GST: 33ARYPN6845B1ZB
        </p>
    </div>
    <div class="top-right">
        <p class="doctor-info">
            <strong>Dr. Nithya D, MD (DVL), DNB</strong><br>
            Consultant Dermatologist<br>
            Reg. No. 84140
        </p>
    </div>
</div>

      <div class="bottom-panel">
        <div class="left-panel">          
            <h5>PROCEDURES</h5>
            <ul>  
                <li>CHEMICAL PEELING<br><span>(for treatment of acne,<br> facial pigmentation and <br> acne scars)</span></li>
                <li>ELECTRO CAUTERY & <br>RADIO FREQUENCY<br><span>(for removal of warts,<br>skin tags etc)</span></li>
                <li>LASERS<br><span>(hair removal,tattoo<br> removal, pigmentation)</span></li>
                <li>DERMA ROLLER /<br> PEN / MNRF<br><span>(for treatment of acne<br>scars)</span></li>
                <li>FACIAL<br> REJUVENATION</li>
                <li>ANTI AGEING<br><span>(Botox injection, threads<br>lifts)</span></li>
                <li>PHOTO THERAPY</li>
                <li>PLATELET RICH <br>PLASMA</li>
                <li>PUNCH EXCISION<br><span>(for removal of<br> unwanted moles)</span></li>
                <li>SCAR REVISION</li>
                <li class = "MICRODERMABRASION">MICRODERMABRASION<br><span>(for treatment of acne <br> scars, wrinkles)</span></li>
                <li>CRYOTHERAPY<br><span>(for treatment of warts<br>keliods)</span></li>
            </ul>
        </div>

        <div class="right-panel">
            <div class="right-content">
            
            
            <div class="custom-divider"></div>

            <div class="info-row">
                <div><strong>Name:</strong> ${data.FullName || ''}</div>
                <div><strong>Date of Consultation:</strong> ${consultationDatetime || ''}</div>
            </div>
            <div class="info-row">
                <div><strong>Age:</strong> ${ageField || ''}</div>
                <div><strong>Registration No:</strong> ${data.PatientRegistrationNumber || ''}</div>
            </div>
            <div class="info-row">
                <div><strong>Gender:</strong> ${data.Gender || ''}</div>   
                <div><strong>Phone No:</strong> ${data.PhoneNumber || ''}</div>          
            </div>

            <div class="page-divider"></div>

            <div class="vitals">
                <span><strong>Weight:</strong> ${data.Weight || ''}kg</span>
                <span><strong>Height:</strong> ${data.Height || ''}cm</span>
                <span><strong>BMI:</strong> ${data.BMI || ''}kg/m<sup>2</sup></span>
                <span><strong>BP:</strong> ${data.BP || ''}mmHg</span>
                <span><strong>Pulse:</strong> ${data.Pulse || ''}bpm</span>
            </div>

            <div class="page-divider"></div>

            ${renderSection("History", data.History)}
            ${renderSection("Clinical Features", data.ClinicalFeature)}
            ${renderSection("Investigation", data.Investigation)}
            ${renderSection("Diagnosis", data.Diagnosis)} 
            
            <div class="section prescription-table-body">
              ${prescriptionSectionHTML}
            </div>

            </div>
            
            <!-- footer -->
             <div class="footer">
                <div class="review-date">
                    Review Date: ${reviewDatetime || ''}
                </div>
                <div class="doctor-notes">
                    <strong>Note:</strong>
                    <p>*If you develop allergies from any medication consult your doctor or near by hospital immediately.<br>
                    *Kindly bring this prescription record or softcopy of every visit</p>
                </div>     
                <div class="consult-time">
                    Consulting Time: 10.30 am to 1.30 pm & 4.30 pm to 7.30 pm | Monday to Saturday [Sunday Holiday]
                </div>
            </div>
        </div>
      </div>
    </div>  
      `;
    // });
    // --------------------------PDF Template End--------------------------
    // 🔄 Replace card body content
    // document.querySelector(".prescription-table-body").innerHTML = prescriptionSectionHTML;
    // <div class="prescription-table-body">${prescriptionSectionHTML}</div>
    // 🔄 Replace card body content
    document.querySelector(".prescription-body").innerHTML = prescriptionBodyHTML;
    // Show the modal (Bootstrap 5)
    const modal = new bootstrap.Modal(document.getElementById('prescriptionModal'));
    modal.show();

  } catch (error) {
    console.error(error);
    document.querySelector(".card-body").innerHTML = `<div class="text-danger text-center">❌ ${error.message}</div>`;
  }finally{
    hideLoader();
  }
}

// ----------------- Download PDF Functions ------------------- //
// function downloadPdf() {
  document.getElementById("downloadPdfBtn").addEventListener("click", function () {
    const element = document.querySelector(".prescription-body");

    // Grab the form where appointment_no lives
    const form = document.querySelector("#appointment_no")?.closest("form");

    // Get all inputs inside the form
    const inputs = form?.querySelectorAll("input.form-control.bg-light");

    // Pick the second input → Full Name
    const patientName = inputs && inputs[1] ? inputs[1].value : "Patient";

    const appointmentNumber = document.querySelector("#appointment_no")?.innerText || "Appointment";

    const safeName = patientName.replace(/[^a-z0-9]/gi, "_");
    const fileName = `${safeName}_${appointmentNumber}.pdf`;

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 , useCORS: true},
      jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
  });
// }

// ----------------- Print PDF Functions ------------------- //

  document.getElementById("printPdfBtn").addEventListener("click", function () {
    const element = document.querySelector(".prescription-body");

    // Grab the form where appointment_no lives
    const form = document.querySelector("#appointment_no")?.closest("form");  

    // Get all inputs inside the form
    const inputs = form?.querySelectorAll("input.form-control.bg-light");

    // Pick the second input → Full Name
    const patientName = inputs && inputs[1] ? inputs[1].value : "Patient";

    const appointmentNumber = document.querySelector("#appointment_no")?.innerText || "Appointment";

    const safeName = patientName.replace(/[^a-z0-9]/gi, "_");
    const fileName = `${safeName}_${appointmentNumber}.pdf`;

    const opt = {
      // margin: [0.5, 0.5, 0.5, 0.5], 
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .toPdf()
      .get('pdf')
      .then(function (pdf) {
        pdf.autoPrint();
        window.open(pdf.output('bloburl'), '_blank');
    });
  });

//---------------Fetch instructions ------------------
async function fetchInstructions() {
  console.log("Fetching instructions...");
  showLoader();
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/v1/appointments/fetch_instructions`, {     
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
      return [];
    }

    const result = await response.json();
    localStorage.setItem("instruction_list", JSON.stringify(result.data));
    return result.data || [];
  } catch (err) {
    console.error(err);
    return [];
  } finally {
    hideLoader();
  }
} 

// ------------------ Fetch Drug Names ------------------
async function fetchDrugNames() {
  showLoader();
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/v1/drug_names/fetch_drug_names`, {     
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
      return [];
    }

    const result = await response.json();
    localStorage.setItem("drug_list", JSON.stringify(result.data));
    return result.data || [];
  } catch (err) {
    console.error(err);
    return [];
  } finally {
    hideLoader();
  }
}
