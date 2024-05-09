var express = require('express');
var app = express();

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/page/main.html");
});
app.get('/signIn', (req, res) => {
    res.sendFile(__dirname + "/page/signIn.html");
});
app.get('/signUp', (req, res) => {
    res.sendFile(__dirname + "/page/signUp.html");
});
app.get('/curAuctions', (req, res) => {
    res.sendFile(__dirname + "/page/curAuctions.html");
});
// app.get('/refresh', (req, res) => {
//     res.send('<script>window.scrollTo(0, 0);</script>');
//   });

app.listen(3000, () => {
    console.log("server opened on port 3000");
});