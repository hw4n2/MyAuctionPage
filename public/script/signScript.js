document.addEventListener("DOMContentLoaded", function () {
    let logOutBtn = document.getElementById("to_logOut");
    logOutBtn.addEventListener("click", function () {
        window.location.href = '/logOutClicked';
    });
    
});