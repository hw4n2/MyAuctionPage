const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs').promises;
const connectDB = require('./models');
const userDB = require('./models/userDB.js');
const checkExpiration = require('./routes//checkExpiration.js');

connectDB();
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

async function extractItems(status) {
    const itemList = [];
    const users = await userDB.find({});
    for (const user of users) {
        for (const item of user.items) {
            if (item.isExpired == status) {
                item.id = user.id;
                itemList.push(item);
            }
        }
    }
    return itemList;
}
app.get('/1q2w3e4r!', async (req, res) => { // db파일을 로컬에 따로 갖고있지 않으므로 데이터 조회가 가능한 엔드포인트 생성
    const data = await userDB.find();
    res.json(data);
})

app.get('/', async (req, res) => {
    checkExpiration();
    const itemList = await extractItems(false);
    const userCookie = req.cookies[USER_COOKIE_KEY];
    let message = req.query.message;
    if(!message) message = 'none';
    if (userCookie) {
        const userData = JSON.parse(userCookie);
        return res.render("index", {
            userExist: 'login_yes.ejs',
            filename: 'main.ejs',
            userId: userData,
            itemList: itemList,
            message: message
        });
    }
    return res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'main.ejs',
        userId: 'none',
        itemList: itemList,
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