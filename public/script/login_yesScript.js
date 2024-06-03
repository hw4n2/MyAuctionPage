document.addEventListener("DOMContentLoaded", function () {
    let mypageBtn = document.getElementById("to_mypage");
    mypageBtn.addEventListener('click', function(){
        window.location.href = '/user/myPage';
    });
    let logOutBtn = document.getElementById("to_logOut");
    logOutBtn.addEventListener("click", function () {
        window.location.href = '/user/logOutClicked';
    });
})