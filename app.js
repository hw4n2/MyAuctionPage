const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs').promises;
//const connectDB = require('./models');
//const User = require('./models/userDB.js');
//connectDB();
const app = express();

app.use('/user', require('./routes/user.js'));
app.use('/auctions', require('./routes/auctions.js'));


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

const dbFile = 'public/users.json';
const USER_COOKIE_KEY = 'USER';

async function fetchAllUsers() {
    const data = await fs.readFile(dbFile);
    const users = JSON.parse(data.toString());
    return users; //객체로 구성된 배열 리턴
}

async function checkExpiration() {
    var today = new Date();
    var dateString = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    var timeString = ('0' + today.getHours()).slice(-2) + ':' + ('0' + today.getMinutes()).slice(-2) + ":00";
    var timeValue = new Date(dateString + " " + timeString);
    const users = await fetchAllUsers();

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
                        notice = `[낙찰] ${users[i].items[j].productName}, ${users[i].id} | 낙찰가 : ${users[i].items[j].bidders[k].price} 원<br>종료일시: ${users[i].items[j].expire_date} ${users[i].items[j].expire_time}`;
                        alreadySent.push(users[i].items[j].bidders[k].id);
                    }
                    else {
                        if (alreadySent.find((id) => id == users[i].items[j].bidders[k].id)) continue;
                        notice = `[낙찰실패] ${users[i].items[j].productName}, ${users[i].id} | 낙찰자 : ${users[i].items[j].bidders[0].id} | 낙찰가 : ${users[i].items[j].bidders[0].price} 원<br>종료일시: ${users[i].items[j].expire_date} ${users[i].items[j].expire_time}`
                        alreadySent.push(users[i].items[j].bidders[k].id);
                    }
                    user.notices.push(notice);
                }
            }
        }
    }
    if (isModified) {
        await fs.writeFile(dbFile, JSON.stringify(users, null, 2));
    }
};




app.get('/', (req, res) => {
    checkExpiration();
    const userCookie = req.cookies[USER_COOKIE_KEY];
    let message = req.query.message;
    if(!message) message = 'none';
    if (userCookie) {
        const userData = JSON.parse(userCookie);
        return res.render("index", {
            userExist: 'login_yes.ejs',
            filename: 'main.ejs',
            userId: userData,
            message: message
        });
    }
    return res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'main.ejs',
        userId: 'none',
        message: message
    });
});



app.get('/about', (req, res) => {

    const user = req.cookies[USER_COOKIE_KEY];
    if (user) {
        const userData = JSON.parse(user);
        return res.render("index", {
            userExist: 'login_yes.ejs',
            filename: 'about.ejs',
            userId: userData,
            message: 'none'
        });

    }
    return res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'about.ejs',
        userId: 'none',
        message: 'none'
    });
});


app.listen(3000, () => {
    console.log("Server Operating: http://localhost:3000");
});