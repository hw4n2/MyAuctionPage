const router = require('express').Router();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const userDB = require('../models/userDB.js');
const checkExpiration = require('./checkExpiration.js');


router.use(express.static(path.join(__dirname, 'public')));
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(express.json());

const USER_COOKIE_KEY = 'USER';


async function fetchUser(id) {
    const user = await userDB.find({id: id});
    return user[0];
}
async function createUser(newUser) {
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashedPassword;
    await userDB.create(newUser);
}



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
    const userId = req.cookies[USER_COOKIE_KEY];
    if (!userId) {
        return res.render('alert', { error: '오류가 발생했습니다. 다시 시도해 해주세요.' });
    }
    const userData = await userDB.findOne({id: JSON.parse(userId)});
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
    const exist = await userDB.findOne({id: id});
    if (password != _password) {
        return res.render('alert', { error: '비밀번호가 일치하지 않습니다.' });
    }
    if (exist) {
        return res.render('alert', { error: '이미 사용중인 아이디 입니다.' });
    }

    const newUser = { id, name }; //유저정보(쿠키)
    res.cookie(USER_COOKIE_KEY, JSON.stringify(newUser.id));
    newUser.password = password;
    newUser.notices = [];
    newUser.items = [];
    await createUser(newUser);
    console.log("[signup]" + newUser.id);
    return res.redirect(`/?message=${encodeURIComponent(`${newUser.id}님, 회원가입되었습니다.`)}`);
});

router.post('/signInSubmit', async (req, res) => {
    checkExpiration();
    const { id, password } = req.body;
    const exist = await fetchUser(id);
    if (exist) {
        if (await bcrypt.compare(password, exist.password)) {
            res.cookie(USER_COOKIE_KEY, JSON.stringify(exist.id));
            console.log("[log in] " + id);
            return res.redirect(`/?message=${encodeURIComponent(`${exist.id}님, 환영합니다.`)}`);
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