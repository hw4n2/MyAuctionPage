const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const ejs = require('ejs');
const app = express();
const db = new Map();

app.use(express.static('public'))
app.use(cookieParser());
app.use(express.urlencoded({ extended: true}));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/', (req, res) => {
    res.render("index", {
        filename: 'main.ejs'
    });
});
app.get('/signIn', (req, res) => {
    res.render("index", {
        filename: 'signIn.ejs'
    });
});
app.get('/signUp', (req, res) => {
    res.render("index", {
        filename: 'signUp.ejs'
    });
});
app.get('/curAuctions', (req, res) => {
    res.render("index", {
        filename: 'curAuctions.ejs'
    });
});


app.listen(3000, () => {
    console.log("server opened on port 3000");
});