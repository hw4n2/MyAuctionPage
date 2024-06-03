
const userDB = require('../models/userDB.js');

async function checkExpiration() {
    var today = new Date();
    var dateString = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    var timeString = ('0' + today.getHours()).slice(-2) + ':' + ('0' + today.getMinutes()).slice(-2) + ":00";
    var timeValue = new Date(dateString + " " + timeString);
    const users = await userDB.find({});
    let isModified = false;
    for (let i = 0; i < users.length; i++) {
        for (let j = 0; j < users[i].items.length; j++) {
            if (users[i].items[j].isExpired) {
                continue;
            }
            let itemTime = new Date(users[i].items[j].expire_date + " " + users[i].items[j].expire_time + ":00");
            if (timeValue.getTime() >= itemTime.getTime()) {
                users[i].items[j].isExpired = true;
                console.log("[Auction expired] " + users[i].id + ", " + users[i].items[j].productName);
                isModified = true;

                let alreadySent = [];
                for (let k = 0; k < users[i].items[j].bidders.length; k++) {
                    const user = users.find((user) => user.id === users[i].items[j].bidders[k].id);
                    let notice;
                    if (k == 0) {
                        notice = `[낙찰] ${users[i].items[j].productName}, ${users[i].id} | 낙찰가 : ${parseInt(users[i].items[j].bidders[k].price).toLocaleString()} 원<br>종료일시: ${users[i].items[j].expire_date} ${users[i].items[j].expire_time}`;
                        alreadySent.push(users[i].items[j].bidders[k].id);
                    }
                    else {
                        if (alreadySent.find((id) => id == users[i].items[j].bidders[k].id)) continue;
                        notice = `[낙찰실패] ${users[i].items[j].productName}, ${users[i].id} | 낙찰자 : ${users[i].items[j].bidders[0].id} | 낙찰가 : ${parseInt(users[i].items[j].bidders[0].price).toLocaleString()} 원<br>종료일시: ${users[i].items[j].expire_date} ${users[i].items[j].expire_time}`
                        alreadySent.push(users[i].items[j].bidders[k].id);
                    }
                    user.notices.push(notice);
                }
            }
        }
    }
    if (isModified) {
        for(const user of users){
            user.markModified('items');
            await user.save();
        }
    }
};

module.exports = checkExpiration;