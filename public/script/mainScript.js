let curIndex = 0;
const outer = document.getElementById('outer-banner');
const list = document.getElementById('bannerArea');
const inners = document.getElementsByClassName('banner-in');
const leftBtn = document.getElementsByClassName('leftBtn');
const rightBtn = document.getElementsByClassName('rightBtn');
const slider = document.getElementsByClassName('bannerSlider');

const sliderStep = parseInt(100 / inners.length);
slider[0].max = sliderStep * (inners.length - 1);
slider[0].value = 0;

for (inner of inners) {
    inner.style.width = `${outer.clientWidth}px`;
}

list.style.width = `${outer.clientWidth * inners.length}px`;
var tmp;
var m;
leftBtn[0].addEventListener("click", function () {
    if (curIndex != 0) {
        curIndex--;
        list.style.marginLeft = `-${outer.clientWidth * curIndex}px`;
        tmp = parseInt(slider[0].value);
        leftBtn[0].disabled = true;
        clearInterval(m);
        m = setInterval(moveSlider, 10, 'left');
    }
    leftBtn[0].disabled = false;
})

rightBtn[0].addEventListener('click', function () {
    if (curIndex != inners.length - 1) {
        curIndex++;
        list.style.marginLeft = `-${outer.clientWidth * curIndex}px`;
        tmp = parseInt(slider[0].value);
        rightBtn[0].disabled = true;
        clearInterval(m);
        m = setInterval(moveSlider, 10, 'right');
    }
    rightBtn[0].disabled = false;
})

slider[0].addEventListener('input', function () {
    clearInterval(m);
    curIndex = Math.round(parseInt(slider[0].value) / sliderStep);
    console.log(curIndex);

    updateBanner();
});

function updateBanner() {
    list.style.marginLeft = `-${outer.clientWidth * curIndex}px`;
    slider[0].value = sliderStep * curIndex;
    leftBtn[0].disabled = false;
    rightBtn[0].disabled = false;
}

function moveSlider(direction) {
    if (direction == 'left') {
        if (parseInt(slider[0].value) <= parseInt(tmp) - parseInt(sliderStep)) {
            console.log(curIndex);
            clearInterval(m);
            leftBtn[0].disabled = false;
        }
        else {
            slider[0].value = parseInt(slider[0].value) - 1;
        }
    }
    else if (direction == 'right') {
        if (parseInt(slider[0].value) >= parseInt(tmp) + parseInt(sliderStep)) {
            console.log(curIndex);
            clearInterval(m);
            rightBtn[0].disabled = false;
        }
        else {
            slider[0].value = parseInt(slider[0].value) + 1;
        }

    }
}

const outerArea = document.getElementById('mainDisplay');
const itemArea = document.getElementById('mainItemInner');
const parsedList = JSON.parse(itemList);
parsedList.forEach(function(item) {
    const imgContainer = document.createElement('div');
    const img = document.createElement('img');
    img.className = 'mainImg';
    imgContainer.className = 'mainImgContainer';
    img.src = `/uploads/${item.imgName}`;
    imgContainer.appendChild(img);
    itemArea.appendChild(imgContainer);

    img.addEventListener('click', function () {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = "/auctions/itemDetails";
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'item';
        input.value = JSON.stringify(item);
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();
    });
});

const cloneBanner = itemArea.cloneNode(true);
cloneBanner.id = "innerClone";
outerArea.appendChild(cloneBanner);

const clonedImg = cloneBanner.querySelectorAll('img');
let index = 0;
parsedList.forEach(function(item) {
    clonedImg[index].addEventListener('click', function () {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = "/auctions/itemDetails";
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'item';
        input.value = JSON.stringify(item);
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();
    });
    index++;
});

itemArea.classList.add('original');
cloneBanner.classList.add('clone');
