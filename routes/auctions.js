const router = require('express').Router();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const multer = require('multer');
const uuid4 = require('uuid4');
const userDB = require('../models/userDB.js');
const checkExpiration = require('./checkExpiration.js');

router.use(express.static(path.join(__dirname, 'public')));
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(express.json());

const upload = multer({
    storage: multer.diskStorage({
        filename(req, file, done) {
            const randomName = uuid4();
            const ext = path.extname(file.originalname);
            const filename = randomName + ext;
            done(null, filename);
        },
        destination(req, file, done) {
            done(null, "./public/uploads");
        },
    }),
});
const uploadMiddleware = upload.single('productImage');

const dbFile = 'public/users.json';
const USER_COOKIE_KEY = 'USER';


async function appendProductData(userId, productData) {
    const user = await userDB.findOne({id: userId});
    productData.bidders = [];
    user.items.push(productData);
    user.items.sort((a, b) => {
        const dateA = new Date(a.expire_date + " " + a.expire_time);
        const dateB = new Date(b.expire_date + " " + b.expire_time);
        const now = new Date();

        const diffA = Math.abs(dateA - now);
        const diffB = Math.abs(dateB - now);

        return diffA - diffB;
    })

    await user.save();
}

async function appendBidder(bidder, itemData) {
    const user = await userDB.findOne({id: itemData.id});
    const item = user.items.find(item => item.imgName === itemData.imgName);
    item.bidders.push(bidder);
    item.bidders.sort((a, b) => parseInt(a.price) >= parseInt(b.price) ? -1 : 1);
    user.markModified('items');
    await user.save();
}


async function extractItems(status) { //경매중or만료된 상품을 선택적으로 db에서 골라오는 함수
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

router.get('/curAuctions', async (req, res) => { //현재 경매중인 상품 페이지
    checkExpiration();
    const user = req.cookies[USER_COOKIE_KEY];
    const itemList = await extractItems(false);
    if (user) {
        const userData = JSON.parse(user);
        return res.render("index", {
            userExist: 'login_yes.ejs',
            filename: 'curAuctions.ejs',
            itemPage: 'onsale.ejs',
            itemList: itemList,
            userId: userData,
            message: 'none'
        });

    }
    return res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'curAuctions.ejs',
        itemPage: 'onsale.ejs',
        itemList: itemList,
        userId: 'none',
        message: 'none'
    });
});
router.get('/expiredPage', async (req, res) => { //경매가 종료된 상품 페이지
    checkExpiration();
    const user = req.cookies[USER_COOKIE_KEY];
    const itemList = await extractItems(true);
    if (user) {
        const userData = JSON.parse(user);
        return res.render("index", {
            userExist: 'login_yes.ejs',
            filename: 'curAuctions.ejs',
            itemPage: 'expired.ejs',
            itemList: itemList,
            userId: userData,
            message: 'none'
        });

    }
    return res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'curAuctions.ejs',
        itemPage: 'expired.ejs',
        itemList: itemList,
        userId: 'none',
        message: 'none'
    });
});


router.get('/sells', (req, res) => { //상품 등록 페이지 접근
    const user = req.cookies[USER_COOKIE_KEY];
    if (user) {
        const userData = JSON.parse(user);
        return res.render("index", {
            userExist: 'login_yes.ejs',
            filename: 'sells.ejs',
            userId: userData,
            message: 'none'
        });

    }
    return res.render('alert', { error: '로그인 후 이용해 주세요.' });
});
router.post('/upload', uploadMiddleware, async (req, res) => { //상품 등록(입찰)
    const user = req.cookies[USER_COOKIE_KEY];
    const userId = JSON.parse(user);
    if (!user) {
        return res.render('alert', { error: '오류가 발생했습니다. 다시 시도해 해주세요.' });
    }
    const userProduct = req.body;
    const { productName, productDetails, productPrice, expire_date, expire_time } = userProduct;
    userProduct.imgName = req.file.filename;
    userProduct.isExpired = false;

    await appendProductData(userId, userProduct);
    console.log("[sell] " + userId + ", " + userProduct.productName);
    return res.redirect(`/?message=${encodeURIComponent('상품 등록이 완료되었습니다.')}`);
})
router.post('/itemDetails', async (req, res) => { //상품 상세페이지
    const user = req.cookies[USER_COOKIE_KEY];
    if (user) {
        const userId = JSON.parse(user);
        const itemData = req.body.item;
        return res.render("index", {
            userExist: 'login_yes.ejs',
            filename: 'itemDetails.ejs',
            item: itemData,
            itemList: 'none',
            userId: userId,
            message: 'none'
        })
    }
    else {
        return res.render('alert', { error: '로그인 후 이용해 주세요.' });
    }
})

router.post('/bid', async (req, res) => {//응찰버튼 클릭 시

    const user = req.cookies[USER_COOKIE_KEY];
    if (user) {
        const userId = JSON.parse(user);

        const price = req.body.priceInput; //사용자가 입력한 응찰가
        const itemData = JSON.parse(req.body.item); //어떤 상품에 응찰했는지 확인용, 응찰자를 추가하기 위한 상품정보
        const bidder = {};
        bidder.id = userId;
        bidder.price = price;
        await appendBidder(bidder, itemData);

        return res.redirect('/auctions/bid/success');
        
    }
    else {
        return res.render('alert', { error: '로그인 후 이용해 주세요.' });
    }
})

router.get('/bid/success', async (req, res) => {
    const user = req.cookies[USER_COOKIE_KEY];
    if (user) {
        const userId = JSON.parse(user);
        const itemList = await extractItems(false);

        return res.render("index", {
            userExist: 'login_yes.ejs',
            filename: 'curAuctions.ejs',
            itemPage: 'onsale.ejs',
            itemList: itemList,
            userId: userId,
            message: '응찰이 완료되었습니다.'
        });
    } else {
        return res.render('alert', { error: '로그인 후 이용해 주세요.' });
    }
});

module.exports = router;
