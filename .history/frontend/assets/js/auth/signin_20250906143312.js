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
// function showLoader() {
//   document.getElementById("loader-overlay").style.display = "flex";
// }

// function hideLoader() {
//   document.getElementById("loader-overlay").style.display = "none";
// }

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

        // console.log("Login result:", result.success);

        if (response.ok && result.success) {
          // alert("Login successful!");
          localStorage.setItem("token", result.data.id_token);
          localStorage.setItem("display_name", result.data.display_name);
          localStorage.setItem("user_role", result.data.user_role);
          localStorage.setItem("email", result.data.email);
          console.log("User role?????: " + localStorage.getItem("user_role"));
          window.location.href = "/admin/index.html";
        } else if (response.ok && result.success === false) {
          console.error("Login failed-------:", result.message);
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: result.message,
          });
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Server error. Try again later.',
        })
        console.error(err);
      }finally {
        hideLoader(); // Hide loader after processing
      }
    });
  }
});

// --------------------------Forgot Password------------------
  document.getElementById("forgot-password").addEventListener("click", function (e) {
    e.preventDefault();
    const modal = new bootstrap.Modal(document.getElementById("forgotPasswordModal"));
    modal.show();
  });

  document.getElementById("forgot-password-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("reset-email").value;

    const token = localStorage.getItem("token");

        showLoader();

        try{
            const res = await fetch(`/api/v1/auth/reset_password/${email}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            });
            const result = await res.json();
            console.log("Login result----:", result.success);
            if (res.ok && result.success) {
                Swal.fire({
                    icon: 'Info',
                    title: 'Reset Password',
                    text: `Password reset link has been sent to ${email}\n Follow the link to reset the password.`,
                }).then(() => {
                loadPage("usermanagement/view_users");
            });
          }
            else if (res.ok && result.success === false) {
              console.log("Login failed-------:", result.message);
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Email!',
                    text: result.message,
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed!',
                    text: 'Failed to send password reset link: ' + result.message,
                })
            }
        } catch (err) {
            Swal.fire({
                    icon: 'error',
                    title: 'Failed!',
                    text: 'Server error: ' + err,                   
                })
            
        }finally{
            hideLoader();
        }

    // Close the modal
    bootstrap.Modal.getInstance(document.getElementById("forgotPasswordModal")).hide();

    // Optionally reset form
    e.target.reset();
  });