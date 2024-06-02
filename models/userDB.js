const mongoose = require('mongoose');
const itemSchema = require('./models/itemDB.js').schema;

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true},
    name: { type: String, required: true},
    password: { type: String, required: true},
    notices: { type: Array, required: true},
    items: { type: [itemSchema], required: true}
});

const User = mongoose.model('userSchema', userSchema);

module.exports = User;
