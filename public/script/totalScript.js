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

    let _signUpBtn = document.getElementById("_to_signUp");
    _signUpBtn.addEventListener("click", function () {
        window.location.href = '/signUp';
    });

    let to_auction_btn = document.getElementById("to_auction");
    to_auction_btn.addEventListener("click", function () {
        window.location.href = '/curAuctions';
    });
    
});

