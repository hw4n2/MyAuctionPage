const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true},
    name: { type: String, required: true},
    password: { type: String, required: true},
    notices: { type: Array, required: true},
    items: { type: Array, required: true}
});

const User = mongoose.model('userSchema', userSchema);

module.exports = User;
