document.addEventListener("DOMContentLoaded", function () {
    let loginBtn = document.getElementById("loginBtn");
    loginBtn.addEventListener("click", function () {
        window.location.href = '/signIn';
    });

    let signUpBtn = document.getElementById("signUpBtn");
    signUpBtn.addEventListener("click", function () {
        window.location.href = '/signUp';
    });
    
});
