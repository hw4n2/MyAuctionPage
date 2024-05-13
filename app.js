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
                userId: userData.id
            });
        }
    }
    
    return res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'main.ejs',
        userId: 'none'
    });
});

app.get('/signIn', (req, res) => {
    res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'signIn.ejs',
        userId: 'none'
    });
});

app.get('/signUp', (req, res) => {
    res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'signUp.ejs',
        userId: 'none'
    });
});
app.post('/signUpSubmit', (req, res) => { //회원가입 제출시 미들웨어
    const { id, password, name } = req.body;
    console.log(req.body);
    const exist = db.get(id);
    if(exist){
        return res.render('existingId', {error: '이미 사용중인 아이디 입니다.'});
        // res.send("<script>alert('이미 사용중인 아이디 입니다.')</script>");
        // res.render("index", {
        //     userExist: 'login_no.ejs',
        //     filename: 'signUp.ejs'
        // });
        //return;
    }

    const newUser = { id, password, name };
    db.set(newUser.id, newUser);
    res.cookie(USER_COOKIE_KEY, JSON.stringify(newUser));
    res.redirect('/');
});

app.get('/curAuctions', (req, res) => {
    const user = req.cookies[USER_COOKIE_KEY];
    if(user){
        const userData = JSON.parse(user);
        alert(userData);
        if(db.get(userData.id)){
            return res.render("index", {
                userExist: 'login_yes.ejs',
                filename: 'curActions.ejs',
                userId: userData.id
            });
        }
    }
    
    return res.render("index", {
        userExist: 'login_no.ejs',
        filename: 'curActions.ejs',
        userId: 'none'
    });
});


app.listen(3000, () => {
    console.log("server opened on port 3000");
});