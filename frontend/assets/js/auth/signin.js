// ---------------Text to Password Toggle------------------
document.querySelector(".toggle-password").addEventListener("click", function () {
  const passwordInput = document.getElementById("password");
  const icon = this.querySelector("i");

  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  icon.className = isPassword ? "bi bi-eye" : "bi bi-eye-slash";
});

//--------------------------Signin Loader------------------
function showLoader() {
  document.getElementById("signin-loader").classList.remove("d-none");
}

function hideLoader() {
  document.getElementById("signin-loader").classList.add("d-none");
}

//--------------------------Login Form Submission------------------
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = document.querySelector('input[type="email"]').value;
      const password = document.querySelector('input[type="password"]').value;

      showLoader(); // Show loader before making the request
      try {
        const response = await fetch('/api/v1/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
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

        if (response.ok && result.success) {
          localStorage.setItem("token", result.data.id_token);
          localStorage.setItem("display_name", result.data.display_name);
          window.location.href = "/admin/index.html";
        } else {
          alert(result.message || "Login failed");
        }
      } catch (err) {
        alert("Server error. Try again later.");
        console.error(err);
      }finally {
        hideLoader(); // Hide loader after processing
      }
    });
  }
});