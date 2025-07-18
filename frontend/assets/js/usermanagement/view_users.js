
function initUserManagementPage() {
  const buttons = document.querySelectorAll(".tab-btn");
  const underline = document.querySelector(".tab-underline");
  const tableBody = document.querySelector("tbody"); // Target the user table body

  // Animate underline
  function moveUnderline(button) {
    const { offsetLeft, offsetWidth } = button;
    underline.style.left = offsetLeft + "px";
    underline.style.width = offsetWidth + "px";
  }

  // Fetch users based on role (admin/staff/pharmacist/all)
  async function fetchUsersByRole(role) {
    showLoader(); // Show loader while fetching data
    try {
      const token = localStorage.getItem("token");

      let url = `/api/v1/users/view_users`;
      if (role && role !== "all") {
        url += `?role=${role}`;
      }

      const response = await fetch(url, {
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
          window.location.href = "/"; // or your login page
        });
        return; // stop further processing
      }

      const result = await response.json();
      const users = result.data?.users || [];

      // Clear table
      tableBody.innerHTML = "";

      if (users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center">No users found.</td></tr>`;
        return;
      }

      // Render each user
      users.forEach((user, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${user.display_name || user.name || "N/A"}</td>
          <td>${user.email || "N/A"}</td>
          <td>${user.user_role || "N/A"}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" title="Edit User" onclick="loadPage('usermanagement/edit_users', { userId: '${user.id}' })">
              <i class="bi bi-pencil"></i>
            </button>
          </td>
        `;
        tableBody.appendChild(row);
      });

    } catch (error) {
      console.error("❌ Error fetching users:", error);
      tableBody.innerHTML = `<tr><td colspan="4" class="text-danger text-center">Failed to load users</td></tr>`;
    }finally {
      hideLoader(); // Hide loader after fetching data
    }
  }

  // Set up tab click handlers
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      moveUnderline(btn);

      const role = btn.getAttribute("data-status");
      console.log("Selected role:", role);
      fetchUsersByRole(role);
    });
  });

  // Initialize
  const activeBtn = document.querySelector(".tab-btn.active");
  if (activeBtn) {
    moveUnderline(activeBtn);
    const defaultRole = activeBtn.getAttribute("data-status");
    fetchUsersByRole(defaultRole);
  }
}

// ✅ Call on page load
initUserManagementPage();
