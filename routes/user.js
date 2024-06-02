const router = require('express').Router();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
//const connectDB = require('./models');
//const User = require('./models/user.js');
//connectDB();

router.use(express.static(path.join(__dirname, 'public')));
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(express.json());

const dbFile = 'public/users.json';
const USER_COOKIE_KEY = 'USER';

async function fetchAllUsers() {
    const data = await fs.readFile(dbFile);
    const users = JSON.parse(data.toString());
    return users; //객체로 구성된 배열 리턴
}
async function fetchUser(id) {
    const users = await fetchAllUsers();
    const user = users.find((user) => user.id === id);
    return user; //객체 리턴
}
async function createUser(newUser) {
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    const users = await fetchAllUsers();
    users.push({
        ...newUser,
        password: hashedPassword,
    });
    await fs.writeFile(dbFile, JSON.stringify(users, null, 2));
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

router.get('/signIn', (req, res) => {
    res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'signIn.ejs',
        userId: 'none',
        message: 'none'
    });
});

router.get('/signUp', (req, res) => {
    res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'signUp.ejs',
        userId: 'none',
        message: 'none'
    });
});
router.get('/mypage', async (req, res) => {
    const user = req.cookies[USER_COOKIE_KEY];
    if (!user) {
        return res.render('alert', { error: '오류가 발생했습니다. 다시 시도해 해주세요.' });
    }
    const userData = await fetchUser(JSON.parse(user));

    res.render("index", {
        userExist: 'login_yes.ejs',
        filename: 'mypage.ejs',
        userId: userData.id,
        userData: userData,
        message: 'none'
    })
})
router.post('/signUpSubmit', async (req, res) => {
    const { id, password, _password, name } = req.body;
    const exist = await fetchUser(id);
    if (exist) {
        return res.render('alert', { error: '이미 사용중인 아이디 입니다.' });
    }
    if (password != _password) {
        return res.render('alert', { error: '비밀번호가 일치하지 않습니다.' });
    }

    const newUser = { id, name }; //유저정보(쿠키)
    res.cookie(USER_COOKIE_KEY, JSON.stringify(newUser.id));
    newUser.password = password;
    newUser.notices = [];
    newUser.items = [];
    console.log(newUser);
    await createUser(newUser);
    console.log(newUser.id + " registered");
    res.render("index", {
        userExist: 'login_yes.ejs',
        filename: 'main.ejs',
        userId: newUser.id,
        message: '회원가입되었습니다.'
    });
});

router.post('/signInSubmit', async (req, res) => {
    checkExpiration();
    const { id, password } = req.body;
    const exist = await fetchUser(id);
    if (exist) {
        if (await bcrypt.compare(password, exist.password)) {
            res.cookie(USER_COOKIE_KEY, JSON.stringify(exist.id));
            console.log("[log in] " + id);
            const message = encodeURIComponent(`${exist.id}님, 환영합니다.`);
            return res.redirect(`/?message=${message}`);
        }
        else {
            return res.render('alert', { error: '비밀번호를 확인해 주세요.' });
        }
    }
    return res.render('alert', { error: '회원정보가 존재하지 않습니다.' });
})

router.get('/logOutClicked', (req, res) => {
    const user = req.cookies[USER_COOKIE_KEY];
    if (!user) {
        res.render('alert', { error: '오류가 발생했습니다.' });
    }
    const userData = JSON.parse(user);
    console.log("[log out] " + userData);
    res.clearCookie(USER_COOKIE_KEY);
    return res.redirect(`/?message=${encodeURIComponent(`로그아웃 되었습니다.`)}`);
})

module.exports = router;