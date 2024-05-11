window.addEventListener("load", function () {
    
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

    let to_act_btn = document.getElementsByClassName("navBtn");
    for(let i = 0; i < 3; i++){
        to_act_btn[i].addEventListener("click", function() {
            window.location.href = '/curAuctions';
        });
    };
    
});

