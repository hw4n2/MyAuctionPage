document.addEventListener("DOMContentLoaded", function () {
    let logoImg = document.getElementById("logoImg");
    logoImg.addEventListener("click", function () {
        window.location.href = '/';
    });

    let loginBtn = document.getElementById("loginBtn");
    loginBtn.addEventListener("click", function () {
        window.location.href = '/signIn';
    });

    let signUpBtn = document.getElementById("signUpBtn");
    signUpBtn.addEventListener("click", function () {
        window.location.href = '/signUp';
    });
    
});

