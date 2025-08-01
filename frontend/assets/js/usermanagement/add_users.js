

// ---------------Text to Password Toggle------------------
document.querySelectorAll(".toggle-password").forEach(button => {
  button.addEventListener("click", function () {
    const input = this.previousElementSibling; // Gets the input just before the button
    const icon = this.querySelector("i");

    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    icon.className = isPassword ? "bi bi-eye" : "bi bi-eye-slash";
  });
});


//---------------- Check Confirm Password -------------
function checkConfirmPassword() {
    const userPassword = document.getElementById("user_password").value.trim();
    const confirmPassword = document.getElementById("confirm_password").value.trim();
  
    if (userPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match.',
      });
      return false; // Return false to indicate validation failure
    } else {
      document.getElementById("confirm_password").setCustomValidity(""); // Clear the error message
      return true; // Return true to indicate validation success
    }
  }


// ---------------- Validate User Form -------------
// function validateUserForm() {
//     console.log("Validating User form...");
//     // Get form values
//     const displayName = document.getElementById("display_name").value.trim();
//     const userEmail = document.getElementById("user_email").value.trim();
//     const userPassword = document.getElementById("user_password");
//     const confirmPassword = document.getElementById("confirm_password").value.trim();
//     const userRole = document.getElementById("user_role").value
//     const pin = document.getElementById("pin").value.trim();  

//   if (!displayName || !userEmail || !userPassword || !confirmPassword || !userRole || !pin) {
//     Swal.fire({
//       icon: 'warning',
//       title: 'Validation',
//       text: 'Please fill in all the required fields.',
//     });
//     return false;
//   }
//   // Additional validation can be added here
//   return true;
// }

async function initUserForm() {

  console.log("Initializing User Form...");
  const userForm = document.getElementById("add-user-form");
  if (!userForm) {
    console.warn("⛔ Form not found!");
    return;
  }
    userForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // ----------- Validate Form Data -----------
      console.log("Validating User form...");
      // if (!validateUserForm()) 
      //   return validateUserForm();

      if (!checkConfirmPassword()) {
        return;
      }

      console.log("User form validated successfully.");

      // ----------- Collect Form Data -----------
      console.log("Collecting User form data...");
      const displayName = document.getElementById("display-name").value;
      const userEmail = document.getElementById("user_email").value;
      const userPassword = document.getElementById("user_password").value;  
      const confirmPassword = document.getElementById("confirm_password").value;
      const userRole = document.getElementById("user_role").value;
      const pin = document.getElementById("pin").value;

      console.log("Display Name:", displayName)

         // Now you can send the form data
      const data = {
        display_name: displayName,
        email: userEmail,
        password: userPassword,
        confirm_password: confirmPassword,
        user_role: userRole,  
        pin : pin,
      };

      console.log("Sending User data:", data);

      // Show loader while processing
      showLoader();

      try {
        const token = localStorage.getItem("token");
        const response = await fetch('/api/v1/users/add_user', {
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

        console.log("Response from server:", result.success); 

        if (response.ok && result.success) {
          Swal.fire({
            icon: 'success',
            title: 'User created successfully!',
            text: `User "${result.data.display_name}" was registered successfully!`,
            confirmButtonText: 'OK',
          }).then(() => {
            // Redirect after user clicks OK
            loadPage("usermanagement/view_users");
          });       
        }else if (response.ok && result.success === false || result.message === "Email already exists.") { 
          Swal.fire({
            icon: 'warning',
            title: '⚠️ Email already exists',
            text: 'The email address you entered is already registered. Please use a different email.',
          });
          // alert("⚠️ Email already exists");
        }
        else {
          Swal.fire({
            icon: 'error',
            title: '⛔ User creation failed',
            // text: 'Please fill in all the required fields.',
          });
          // alert("⛔ User creation failed");
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

//----------------Initialize the functionality -------------
initUserForm(); // Initialize the form event listener