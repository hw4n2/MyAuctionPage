const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const ejs = require('ejs');
const app = express();
const db = new Map();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

const USER_COOKIE_KEY = 'USER';
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
    const user = req.cookies[USER_COOKIE_KEY];
    if(user){
        const userData = JSON.parse(user);
        if(db.get(userData.id)){
            return res.render("index", {
                userExist: 'login_yes.ejs',
                filename: 'main.ejs',
                userId: userData.id,
                message: 'none'
            });
        }
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
app.post('/signUpSubmit', (req, res) => { //회원가입 제출시 미들웨어
    const { id, password, name } = req.body;
    const exist = db.get(id);
    if(exist){
        return res.render('alert', {error: '이미 사용중인 아이디 입니다.'});
    }

    const newUser = { id, password, name };
    db.set(newUser.id, newUser);
    res.cookie(USER_COOKIE_KEY, JSON.stringify(newUser));
    res.render("index", {
        userExist: 'login_yes.ejs',
        filename: 'main.ejs',
        userId: newUser.id,
        message: '회원가입되었습니다.'
    });
});

app.post('/signInSubmit', (req, res) => {
    const { id, password } = req.body;
    const exist = db.get(id);
    if(exist){
        if(exist.password == password){
            res.cookie(USER_COOKIE_KEY, JSON.stringify(exist));
            return res.render("index", {
                userExist: 'login_yes.ejs',
                filename: 'main.ejs',
                userId: exist.id,
                message: `${exist.id}님, 환영합니다.`
            })
        }
        else{
            res.render('alert', {error: '비밀번호를 확인해 주세요.'});
        }
    }
    return res.render('alert', {error: '회원정보가 존재하지 않습니다.'});
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
    if(user){
        const userData = JSON.parse(user);
        if(db.get(userData.id)){
            return res.render("index", {
                userExist: 'login_yes.ejs',
                filename: 'curAuctions.ejs',
                userId: userData.id,
                message: 'none'
            });
        }
    }
    return res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'curAuctions.ejs',
        userId: 'none',
        message: 'none'
    });
});


app.listen(3000, () => {
    console.log("server opened on port 3000");
});