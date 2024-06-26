const parsedUser = JSON.parse(userData);
const userContainer = document.getElementById("userInfoContainer");
const itemContainer = document.getElementById("myItemContainer");
const noticeContainer = document.getElementById("noticeContainer");

const header = document.createElement('div');
const id = document.createElement('div');
header.textContent = '회원정보';
header.style = "font-size: 25px;"
id.textContent = parsedUser.id;
userContainer.append(header, id);

const itemHeader = document.createElement('div');
itemHeader.textContent = '내 상품';
itemHeader.style = 'text-align: center; font-size: 20px;';
itemContainer.append(itemHeader);

const noticeHeader = document.createElement('div');
noticeHeader.textContent = '응찰 기록';
noticeHeader.style = 'text-align: center; font-size: 20px;';
noticeContainer.append(noticeHeader);

if (parsedUser.items.length == 0) {
    const item = document.createElement('div');
    item.textContent = '등록한 상품이 없습니다.'
    itemContainer.appendChild(item);
}
else {
    parsedUser.items.sort((a, b) => {
        const dateA = new Date(a.expire_date + " " + a.expire_time);
        const dateB = new Date(b.expire_date + " " + b.expire_time);
        const now = new Date();

        const diffA = Math.abs(dateA - now);
        const diffB = Math.abs(dateB - now);

        return diffB - diffA;
    })

    for (let i = 0; i < parsedUser.items.length; i++) {
        const itemIter = parsedUser.items[i];
        const item = document.createElement('div');
        let status;
        if (itemIter.isExpired) status = '[경매종료]';
        else status = '[경매중]';
        item.innerHTML = `${status} ${to_Dday(itemIter.expire_date)}
${itemIter.productName} | 응찰 ${itemIter.bidders.length}<hr>`;
        item.style = "cursor: pointer;"
        itemContainer.appendChild(item);

        item.addEventListener('click', function () {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = "/auctions/itemDetails";
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'item';
            parsedUser.items[i].id = parsedUser.id;
            input.value = JSON.stringify(parsedUser.items[i]);
            form.appendChild(input);

            document.body.appendChild(form);
            form.submit();
        })
    }
}

if (parsedUser.notices.length == 0) {
    const noticeBox = document.createElement('div');
    noticeBox.innerHTML = '응찰 결과가 없습니다.';
    noticeContainer.appendChild(noticeBox);
}
else {
    for (let i = parsedUser.notices.length - 1; i >= 0; i--) {
        const notice = parsedUser.notices[i];
        const noticeBox = document.createElement('div');
        noticeBox.innerHTML = notice + '<hr>';
        noticeContainer.appendChild(noticeBox);
    }
}



function to_Dday(date) {
    const today = new Date();
    const targetDate = new Date(date);
    const differenceInTime = targetDate - today;
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24));

    if (differenceInDays > 0) {
        return `D-${differenceInDays}`;
    } else if (differenceInDays === 0) {
        return 'D-day';
    } else {
        return '';
    }
}