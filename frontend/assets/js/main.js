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
        setPageHeader(" ", showName, "Overview of appointments, patients, and clinic activity",img_url);
        loadScriptOnce("/admin/assets/js/dashboard/dashboard.js");
        
      }

      //-------------------------Patients scripts--------------------------
      if (relativePath === "patients/add_patients") {
        // loadStyleOnce("admin/assets/css/patients/add_patients.css");
        loadScriptOnce("/admin/assets/js/patients/add_patients.js");
      }
      if (relativePath === "patients/view_patients") {
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
    console.log("Using custom metadata for header:", meta);
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
function showLoader() {
  document.getElementById("global-loader").classList.remove("d-none");
}

function hideLoader() {
  document.getElementById("global-loader").classList.add("d-none");
}
//----------Loader Functionality End---------

// On page load
window.onload = () => {
  const token = localStorage.getItem("token");
  if (!token || isTokenExpired(token)) {
    console.warn("No valid token found. Redirecting to sign-in page.");
    // localStorage.removeItem("token");
    // loadPage("auth/signin");
    return;
  } else {
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
