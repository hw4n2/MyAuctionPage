document.addEventListener("DOMContentLoaded", function () {
    let signUpBtn = document.getElementById("signUpBtn");
    signUpBtn.addEventListener("click", function () {
        window.location.href = '/signUpSubmit';
    });

    let logOutBtn = document.getElementById("to_logOut");
    logOutBtn.addEventListener("click", function () {
        window.location.href = '/logOutClicked';
    });
    
});