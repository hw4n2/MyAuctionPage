window.addEventListener("load", function () {
    let logoImg = document.getElementById("logoImg");
    logoImg.addEventListener("click", function () {
        window.location.href = '/';
    });
    let to_act_btn = document.getElementsByClassName("navBtn");
        btns = ['/curAuctions', '/sells', '/about'];
        for (let i = 0; i < 3; i++) {
            to_act_btn[i].addEventListener("click", function () {
                window.location.href = btns[i];
            });
        };
});

