document.addEventListener("DOMContentLoaded", function () {
    let _signUpBtn = document.getElementById("_to_signUp");
    _signUpBtn.addEventListener("click", function () {
        window.location.href = '/user/signUp';
    });
})