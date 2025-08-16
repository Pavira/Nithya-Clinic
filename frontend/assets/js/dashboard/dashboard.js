// dashboard.js


document.getElementById("filter-start").addEventListener("change", initDashboardPage);
document.getElementById("filter-end").addEventListener("change", initDashboardPage);
document.getElementById("filter-today").addEventListener("click", function () {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("filter-start").value = today;
    document.getElementById("filter-end").value = today;
    initDashboardPage();
});

async function initDashboardPage(){
    showLoader();

    const startDateInput = document.getElementById("filter-start");
    const endDateInput = document.getElementById("filter-end");

    console.log("Initializing Dashboard..."+ startDateInput.value + endDateInput.value);

    const today = new Date().toISOString().split("T")[0];
    const startDate = startDateInput.value || today;
    const endDate = endDateInput.value || today;

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/v1/dashboard/dashboard?start_date=${startDate}&end_date=${endDate}`, {
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
                text: 'Please sign in again.',
            }).then(() => {
                localStorage.removeItem("token");
                window.location.href = "/";
            });
            return;
        }

        const result = await response.json();

        if (result.success) {
            document.getElementById("outpatients-count").textContent = result.out_patient.count;
            document.getElementById("op-revenue").textContent = `₹ ${result.out_patient.fees}`;
            document.getElementById("op-procedures-patients-count").textContent = result.out_procedure.count;
            document.getElementById("op-procedures-revenue").textContent = `₹ ${result.out_procedure.fees}`;
            const totat_revenue = result.out_patient.fees + result.out_procedure.fees;
            document.getElementById("total-revenue").textContent = `₹ ${totat_revenue}`;
        } else {
            Swal.fire({ icon: 'error', title: 'Data fetch failed' });
        }
    } catch (error) {
        console.error("Dashboard error:", error);
    } finally {
        hideLoader();
    }
}

function uploadData() {
    const token = localStorage.getItem("token");
    showLoader();
    fetch(`/api/v1/dashboard/upload`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    }).then(res => res.json())
    .then(data => {
        if (data.success) {
            console.log("Data uploaded successfully.");
        } else {
            console.error("Data upload failed:", data.message);
        }
    })
    .catch(err => {
        console.error("Error uploading data:", err);
    })
    .finally(() => {
        hideLoader();
    });
}

function upload(){
    document.addEventListener("click", function (e) {
        const button = e.target.closest("#upload");
        if (button) {
            e.preventDefault(); // 🛑 Prevent default form submission
            uploadData();
        }
    });
    
}


initDashboardPage();
upload();