const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const multer = require('multer');
const uuid4 = require('uuid4');
const { time } = require('console');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
console.log('hello');

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
async function appendProductData(userId, productData) {
    const users = await fetchAllUsers();
    const user = users.find((user) => user.id === userId);
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

    await fs.writeFile(dbFile, JSON.stringify(users, null, 2));
}

async function appendBidder(bidder, itemData) {
    const users = await fetchAllUsers();
    const userItems = users.find(user => user.id === itemData.id).items;
    const item = userItems.find(item => item.imgName === itemData.imgName);
    item.bidders.push(bidder);
    item.bidders.sort((a, b) => parseInt(a.price) >= parseInt(b.price) ? -1 : 1);

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
async function extractItems(status) {
    const itemList = [];
    const users = await fetchAllUsers();
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



app.get('/', (req, res) => {
    checkExpiration();
    const userCookie = req.cookies[USER_COOKIE_KEY];
    if (userCookie) {
        const userData = JSON.parse(userCookie);
        return res.render("index", {
            userExist: 'login_yes.ejs',
            filename: 'main.ejs',
            userId: userData,
            message: 'none'
        });
    }
    return res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'main.ejs',
        userId: 'none',
        message: 'none'
    });
});

app.get('/signIn', (req, res) => {
    res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'signIn.ejs',
        userId: 'none',
        message: 'none'
    });
});

app.get('/signUp', (req, res) => {
    res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'signUp.ejs',
        userId: 'none',
        message: 'none'
    });
});
app.get('/mypage', async (req, res) => {
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
app.post('/signUpSubmit', async (req, res) => {
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

app.post('/signInSubmit', async (req, res) => {
    checkExpiration();
    const { id, password } = req.body;
    const exist = await fetchUser(id);
    if (exist) {
        if (await bcrypt.compare(password, exist.password)) {
            res.cookie(USER_COOKIE_KEY, JSON.stringify(exist.id));
            console.log("[log in] " + id);
            return res.render("index", {
                userExist: 'login_yes.ejs',
                filename: 'main.ejs',
                userId: exist.id,
                message: `${exist.id}님, 환영합니다.`
            })
        }
        else {
            return res.render('alert', { error: '비밀번호를 확인해 주세요.' });
        }
    }
    return res.render('alert', { error: '회원정보가 존재하지 않습니다.' });
})

app.get('/logOutClicked', (req, res) => {
    const user = req.cookies[USER_COOKIE_KEY];
    if (!user) {
        res.render('alert', { error: '오류가 발생했습니다.' });
    }
    const userData = JSON.parse(user);
    console.log("[log out] " + userData);
    res.clearCookie(USER_COOKIE_KEY);
    res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'main.ejs',
        userId: 'none',
        message: '로그아웃되었습니다.'
    })
})

app.get('/curAuctions', async (req, res) => {
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
app.get('/expiredPage', async (req, res) => {
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


app.get('/sells', (req, res) => {
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
app.post('/upload', uploadMiddleware, async (req, res) => {
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
    return res.render("index", {
        userExist: 'login_yes.ejs',
        filename: 'main.ejs',
        userId: userId,
        message: '상품 등록이 완료되었습니다.'
    });
})
app.post('/itemDetails', async (req, res) => {
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

app.post('/bid', async (req, res) => {

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

        return res.render("index", {
            userExist: 'login_yes.ejs',
            filename: 'curAuctions.ejs',
            itemPage: 'onsale.ejs',
            itemList: itemList,
            userId: userId,
            message: '응찰이 완료되었습니다.'
        })
    }
    else {
        return res.render('alert', { error: '로그인 후 이용해 주세요.' });
    }
})

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
    console.log("server opened on port 3000");
});