function submitConfirm(){
    const name = document.getElementById("productName").value;
    const price = document.getElementById("productPrice").value;
    const expire_date = document.getElementById("expire_date").value;
    const expire_time = document.getElementById("expire_time").value;
    return confirm(`제품명 : ${name}
가격 : ${price} 원
경매 종료일 : ${expire_date} ${expire_time}
위 기한까지 최고 응찰가를 제시한 고객이 낙찰자로 선정됩니다.
등록하시겠습니까?`
    );
}