const router = require('express').Router();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const multer = require('multer');
const uuid4 = require('uuid4');
const connectDB = require('../models');
const userDB = require('../models/userDB.js');
connectDB();

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
        for(const user of users){
            user.markModified('items');
            await user.save();
        }
    }
};
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

router.get('/curAuctions', async (req, res) => {
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
router.get('/expiredPage', async (req, res) => {
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


router.get('/sells', (req, res) => {
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
router.post('/upload', uploadMiddleware, async (req, res) => {
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
router.post('/itemDetails', async (req, res) => {
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

router.post('/bid', async (req, res) => {

    const user = req.cookies[USER_COOKIE_KEY];
    if (user) {
        const userId = JSON.parse(user);

        const price = req.body.priceInput;
        const itemData = JSON.parse(req.body.item);
        const bidder = {};
        bidder.id = userId;
        bidder.price = price;
        await appendBidder(bidder, itemData);
        const itemList = await extractItems(false);

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
