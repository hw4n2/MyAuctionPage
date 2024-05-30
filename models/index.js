const mongoose = require('mongoose');
const connect = () => { 
    mongoose
    .connect(
        "mongodb+srv://kjh557711:UCVnI1v2RnJqCy1l@cluster0.uysmkl0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    )
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));
};

module.exports = connect;

