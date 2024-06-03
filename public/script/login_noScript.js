document.addEventListener("DOMContentLoaded", function () {
    let loginBtn = document.getElementById("to_login");
    loginBtn.addEventListener("click", function () {
        window.location.href = '/user/signIn';
    });

    let signUpBtn = document.getElementById("to_signUp");
    signUpBtn.addEventListener("click", function () {
        window.location.href = '/user/signUp';
    });
})