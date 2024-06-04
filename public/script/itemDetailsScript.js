const container = document.getElementById("detailArea");
const imgContainer = document.createElement('div');
imgContainer.className = '_imgContainer';
const detailImg = document.createElement('img');
detailImg.className = '_itemImg';
detailImg.src = `../uploads/${item.imgName}`;
imgContainer.appendChild(detailImg);
imgContainer.addEventListener("click", function () {
    window.open(`../uploads/${item.imgName}`);
})

const infoDiv = document.createElement('div');
infoDiv.className = '_infoContainer';
infoDiv.style = "border-left: 1px solid grey";

const infoHeader = document.createElement('div');
infoHeader.className = '_infoHeader';
const dDay = document.createElement('div');
dDay.className = 'dDayTag';
dDay.classList.add('has-text');
dDay.textContent = to_Dday(item.expire_date);
const isMine = document.createElement('div');
isMine.className = 'isMineTag';
if (item.id == cookieId) {
    isMine.textContent = '내 상품';
    isMine.classList.add('has-text');
}
else {
    if (!item.isExpired) {
        isMine.textContent = `경매중`;
        isMine.classList.add('has-text');
    }
}
const bidStatus = document.createElement('div');
bidStatus.className = 'bidNum';
if (item.isExpired) {
    if (item.bidders.length == 0) {
        bidStatus.textContent = '유찰';
        bidStatus.classList.add('has-text');
    }
    else if (item.bidders.length != 0) {
        bidStatus.textContent = '낙찰';
        bidStatus.classList.add('has-text');
    }
}
else if (!item.isExpired) {
    if (item.bidders.length == 0) {
        bidStatus.textContent = '';
    }
    else if (item.bidders.length != 0) {
        bidStatus.textContent = `응찰 ${ item.bidders.length }`;
        bidStatus.classList.add('has-text');
    }
}

infoHeader.append(dDay, isMine, bidStatus);

const newName = document.createElement('div');//제목
newName.className = '_itemName';
newName.textContent = `제품명 : ${item.productName}`;

const newDetail = document.createElement('div');//상세설명
newDetail.className = '_itemDetail';
newDetail.textContent = `상세설명 : ${item.productDetails}`;

const newId = document.createElement('div');//아이디
newId.className = '_userId_item';
newId.textContent = `판매자 : ${item.id}`;

const newPrice = document.createElement('div');//가격
newPrice.className = '_itemPrice';
newPrice.textContent = `정가 : KRW ${parseInt(item.productPrice).toLocaleString()}`;

const bid = document.createElement('div');
bid.className = '_bidNum';
if (item.isExpired) {
    if (item.bidders.length != 0) {
        bid.textContent = `낙찰(낙찰자) : KRW ${parseInt(item.bidders[0].price).toLocaleString()} (${item.bidders[0].id})`;
    }
    else bid.textContent = '낙찰자가 없습니다.';
}
else {
    if (item.bidders.length != 0) {
        bid.textContent = `현재가 : KRW ${parseInt(item.bidders[0].price).toLocaleString()} (응찰 ${item.bidders.length}/10)`;
        if(item.bidders.length >= 2) {
            bid.textContent = `현재가 : KRW ${parseInt(item.bidders[0].price).toLocaleString()} | 직전가 : KRW ${parseInt(item.bidders[1].price).toLocaleString()} (응찰 ${item.bidders.length}/10)`;
        }
    }
    else bid.textContent = '응찰자가 없습니다.';
}


const periodDate = document.createElement('div');//마감기간
periodDate.className = '_itemPeriod';
periodDate.innerHTML = '마감 : ' + formatDate(item.expire_date) + ' ' + formatTime(item.expire_time);

const priceInput = document.createElement('input');
priceInput.className = 'priceInput';
priceInput.type = 'number';
priceInput.name = 'priceInput';
priceInput.placeholder = "응찰가";
priceInput.required = true;
if (item.isExpired) {
    priceInput.style = "display: none";
}

const buyBtn = document.createElement('button');
buyBtn.className = 'buyBtn';
buyBtn.textContent = '응찰';
if (item.isExpired) {
    buyBtn.style = "display: none";
}

const form = document.createElement('form');
form.className = 'formContainer';
form.method = 'POST';
form.action = '/auctions/bid';
form.onsubmit = function submitConfirm() {
    if (cookieId == item.id) {
        alert('본인의 상품에는 응찰할 수 없습니다.');
        return false;
    }
    else if (item.bidders.length >= 10) {
        alert('응찰 정원이 초과되었습니다.');
        return false;
    }
    else if (item.bidders.length != 0 && parseInt(item.bidders[0].price) >= priceInput.value) {
        alert('현재가보다 낮거나 같은 가격으로 응찰할 수 없습니다.');
        return false;
    }
    return confirm(`${item.productName} 을(를) ${parseInt(priceInput.value).toLocaleString()} 원에 응찰하시겠습니까?`);
};

const object = document.createElement('input');
object.type = 'hidden';
object.name = 'item';
object.value = JSON.stringify(item);
form.appendChild(object);

infoDiv.append(infoHeader, newId, newName, newDetail, newPrice, bid, periodDate, priceInput, buyBtn);
form.appendChild(infoDiv);
container.append(imgContainer, form);


function formatDate(inputDate) {
    const weekDay = ['일', '월', '화', '수', '목', '금', '토'];
    const date = weekDay[new Date(inputDate).getDay()];
    const parts = inputDate.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${year}/${month}/${day}(${date})`;
}
function formatTime(inputTime) {
    const parts = inputTime.split(':');
    const hour = parts[0];
    const minute = parts[1];
    return `${hour}시 ${minute}분`;
}
function to_Dday(date) {
    const today = new Date();
    const targetDate = new Date(date);
    const differenceInTime = targetDate - today;
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24));

    if (differenceInDays > 0) {
        return `D-${differenceInDays}`;
    } else if (differenceInDays === 0) {
        return 'D-0';
    } else {
        return `마감(D+${Math.abs(differenceInDays)})`;
    }
}