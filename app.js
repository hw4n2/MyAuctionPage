const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const multer = require('multer');
const uuid4 = require('uuid4');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

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
async function appendProductData(userData, productData){
    const users = await fetchAllUsers();
    const user = users.find((userData) => userData.id == userData.id);
    user.items.push(productData);

    await fs.writeFile(dbFile, JSON.stringify(users, null, 2));
}



app.get('/', (req, res) => {
    const userCookie = req.cookies[USER_COOKIE_KEY];
    if (userCookie) {
        const userData = JSON.parse(userCookie);
        return res.render("index", {
            userExist: 'login_yes.ejs',
            filename: 'main.ejs',
            userId: userData.id,
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
app.post('/signUpSubmit', async (req, res) => {
    const { id, password, name } = req.body;
    const exist = await fetchUser(id);
    if (exist) {
        return res.render('alert', { error: '이미 사용중인 아이디 입니다.' });
    }

    const newUser = { id, name }; //유저정보(쿠키)
    res.cookie(USER_COOKIE_KEY, JSON.stringify(newUser, null, 2));
    newUser.password = password;
    newUser.items = [];
    console.log(newUser);
    await createUser(newUser);
    res.render("index", {
        userExist: 'login_yes.ejs',
        filename: 'main.ejs',
        userId: newUser.id,
        message: '회원가입되었습니다.'
    });
});

app.post('/signInSubmit', async (req, res) => {
    const { id, password } = req.body;
    const exist = await fetchUser(id);
    if (exist) {
        if (await bcrypt.compare(password, exist.password)) {
            res.cookie(USER_COOKIE_KEY, JSON.stringify(exist, null, 2));
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
    res.clearCookie(USER_COOKIE_KEY);
    res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'main.ejs',
        userId: 'none',
        message: '로그아웃되었습니다.'
    })
})

app.get('/curAuctions', (req, res) => {
    const user = req.cookies[USER_COOKIE_KEY];
    if (user) {
        const userData = JSON.parse(user);
        return res.render("index", {
            userExist: 'login_yes.ejs',
            filename: 'curAuctions.ejs',
            userId: userData.id,
            message: 'none'
        });

    }
    return res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'curAuctions.ejs',
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
            userId: userData.id,
            message: 'none'
        });

    }
    return res.render('alert', { error: '로그인 후 이용해 주세요.' });
});
app.post('/upload', uploadMiddleware, async (req, res) => {
    const user = req.cookies[USER_COOKIE_KEY];
    const userId = JSON.parse(user).id;
    if(!user){
        return res.render('alert', { error: '오류가 발생했습니다. 다시 시도해 해주세요.' });
    }
    const userProduct = req.body;
    const { productName, productDetails, productPrice, period_data, period_time } = userProduct;
    userProduct.imgName = req.file.filename;
    
    await appendProductData(user, userProduct);
    return res.render("index", {
        userExist: 'login_yes.ejs',
        filename: 'main.ejs',
        userId: userId,
        message: '상품 등록이 완료되었습니다.'
    });
})
app.get('/about', (req, res) => {
    const user = req.cookies[USER_COOKIE_KEY];
    if (user) {
        const userData = JSON.parse(user);
        return res.render("index", {
            userExist: 'login_yes.ejs',
            filename: 'about.ejs',
            userId: userData.id,
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