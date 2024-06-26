const parsedList = JSON.parse(itemList);
if (parsedList.length == 0) {
    const container = document.getElementById('itemArea');
    container.append(document.createElement('div').textContent = '아직 경매가 종료된 상품이 없습니다.');
    container.style = "display:flex; justify-content: center; top: 20%";
}
parsedList.sort((a, b) => {
    const dateA = new Date(a.expire_date + " " + a.expire_time);
    const dateB = new Date(b.expire_date + " " + b.expire_time);
    const now = new Date();

    const diffA = Math.abs(dateA - now);
    const diffB = Math.abs(dateB - now);

    return diffA - diffB;
})

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
        return `D+${Math.abs(differenceInDays)}`;
    }
}

const container = document.getElementById("itemArea");
for (const item of parsedList) {
    const newDiv = document.createElement('div');
    newDiv.className = 'itemContainer';

    const imgContainer = document.createElement('div');
    imgContainer.className = 'imgContainer';
    const newImg = document.createElement('img'); //이미지
    newImg.className = 'itemImg';
    newImg.src = `/uploads/${item.imgName}`;
    imgContainer.appendChild(newImg);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'infoContainer';

    const infoHeader = document.createElement('div');
    infoHeader.className = '_infoHeader';
    const dDay = document.createElement('div');
    dDay.className = 'dDayTag';
    dDay.textContent = to_Dday(item.expire_date);
    dDay.classList.add('has-text');
    const isMine = document.createElement('div');
    isMine.className = 'isMineTag';
    if (item.id == cookieId) {
        isMine.textContent = '내 상품';
        isMine.classList.add('has-text');
    }
    const bidNum = document.createElement('div');
    bidNum.className = 'bidNum';
    if (item.bidders.length != 0) {
        bidNum.textContent = `낙찰`;
    }
    else {
        bidNum.textContent = `유찰`;
    }
    bidNum.classList.add('has-text');
    infoHeader.append(dDay, isMine, bidNum);

    const newName = document.createElement('div');//제목
    newName.className = 'itemName';
    newName.textContent = `제품명 : ${item.productName}`;

    const newId = document.createElement('div');//아이디
    newId.className = 'userId_item';
    newId.textContent = `판매자 : ${item.id}`;

    const newPrice = document.createElement('div');//가격
    newPrice.className = 'itemPrice';
    newPrice.textContent = `정가 : KRW ${parseInt(item.productPrice).toLocaleString()}`;

    const periodDate = document.createElement('div');//마감기간
    periodDate.className = 'itemPeriod';
    periodDate.innerHTML = '마감 : ' + formatDate(item.expire_date) + ' ' + formatTime(item.expire_time);

    const nullDiv = document.createElement('div');
    nullDiv.style = "height: 5%";

    const to_detail = document.createElement('div');
    to_detail.className = 'to_detailBtn';
    to_detail.textContent = '상세보기';

    infoDiv.append(infoHeader, newName, newId, newPrice);
    if (item.bidders.length != 0) {
        const bidPrice = document.createElement('div');
        bidPrice.textContent = `낙찰가 : KRW ${parseInt(item.bidders[0].price).toLocaleString()}`;
        bidPrice.style = "color: red;"
        infoDiv.append(bidPrice, periodDate, to_detail);
    }
    else {
        infoDiv.append(periodDate, nullDiv, to_detail);
    }
    newDiv.append(imgContainer, infoDiv);
    container.appendChild(newDiv);

    to_detail.addEventListener("click", function () {
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
    })
}
function formatDate(inputDate) {
    const weekDay = ['일', '월', '화', '수', '목', '금', '토'];
    const date = weekDay[new Date(inputDate).getDay()];
    const parts = inputDate.split('-');
    const month = parts[1];
    const day = parts[2];
    return `${month}/${day}(${date})`;
}
function formatTime(inputTime) {
    const parts = inputTime.split(':');
    const hour = parts[0];
    const minute = parts[1];
    return `${hour}:${minute}`;
}