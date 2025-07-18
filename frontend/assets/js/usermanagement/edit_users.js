
    // ---------------Update User Functionality ---------------
    document.getElementById("update-user").addEventListener("click", async (e) => {
        e.preventDefault();

        const updatedUser = {
            
            display_name: document.getElementById("display-name").value,
            user_role: document.getElementById("user_role").value,
            PIN: document.getElementById("pin").value
        };
        const userId = window.pageParams?.userId;

        const token = localStorage.getItem("token");

        showLoader();

        try{
            const updateRes = await fetch(`/api/v1/users/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser)
        });

        if (updateRes.status === 401) {
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

        const updateResult = await updateRes.json();

        if (updateRes.ok && updateResult.success) {
            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: `User ${updateResult.data.display_name} updated successfully.`,
                showConfirmButton: false,
                timer: 1500
            }).then(loadPage("usermanagement/view_users"));
            
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
    document.getElementById("delete-user").addEventListener("click", async (e) => {
        e.preventDefault();

        const userId = window.pageParams?.userId;
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

        if (result.isConfirmed) {
            const deleteRes = await fetch(`/api/v1/users/${userId}`, {
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
                text: 'User has been deleted successfully.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                loadPage("usermanagement/view_users");
            })
            } else {
            Swal.fire({
                icon: 'error',
                title: 'Failed!',
                text: 'Failed to delete user: ' + deleteResult.message,
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                loadPage("usermanagement/view_users");
            })            
            }
        }
        });
            
        } catch (error) {
            alert("Server error. Try again later.");
            console.error(error);
        } finally {
            hideLoader();
            
        }
        
    });
    // --------------------Reset Password Functionality --------------------
    document.getElementById("reset-password-link").addEventListener("click", async (e) => {
        e.preventDefault();

        const email = document.getElementById("user_email").value;
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
            if (res.ok && result.success) {
                Swal.fire({
                    icon: 'Info',
                    title: 'Reset Password',
                    text: `Password reset link has been sent to ${email}\n Follow the link to reset the password.`,
                }).then(() => {
                loadPage("usermanagement/view_users");
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
    })  

async function initEditUsersPage() {
    const userId = window.pageParams?.userId;
    console.log(userId);

    if (!userId) {
        console.error("No user selected");
        return;
    }

    const token = localStorage.getItem("token");

    showLoader();
    
    try {
        // Fetch user data
    const res = await fetch(`/api/v1/users/${userId}`, {
        method: "GET",
        headers: {
        "Authorization": `Bearer ${token}`,
        }
    });

    const result = await res.json();
    const user = result.data;

    // Fill the form
    document.getElementById("user_id").value = user.uid;
    document.getElementById("display-name").value = user.display_name;
    document.getElementById("user_email").value = user.email;
    document.getElementById("user_role").value = user.user_role;
    document.getElementById("pin").value = user.PIN;

    } 
    catch (err) {
        alert("Server error. Try again later.");
        console.error(err);
    }
    finally {
        hideLoader();
    }
}

initEditUsersPage();