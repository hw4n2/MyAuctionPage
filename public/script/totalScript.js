document.addEventListener("DOMContentLoaded", function () {
    let logoImg = document.getElementById("logoImg");
    logoImg.addEventListener("click", function () {
        window.location.href = '/';
    });

    let loginBtn = document.getElementById("to_login");
    loginBtn.addEventListener("click", function () {
        window.location.href = '/signIn';
    });

    let signUpBtn = document.getElementById("to_signUp");
    signUpBtn.addEventListener("click", function () {
        window.location.href = '/signUp';
    });
    
});

