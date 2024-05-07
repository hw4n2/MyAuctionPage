const express = require('express');
const app = express();

// 요청 URL과 메서드를 콘솔에 로그하는 미들웨어 정의
const logger = (req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next(); // 다음 미들웨어 또는 라우트 핸들러 실행
};

// 미들웨어를 모든 요청에 적용
app.use('/main', logger);
app.use('/index', (req, res, next) => {
    res.send("<script>alert('hello');</script>");
    //next();
})

// 라우트 정의
app.get('/main', (req, res) => {
    res.send('Hello World!');
});

app.get('/index', (req, res) => {
    res.send("index page");
})

app.listen(3000, () => {
    console.log('Server started on port 3000');
});