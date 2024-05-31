const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    productName: { type: String, required: true},
    productDetails: { type: String, required: true},
    productPrice: { type: Number, required: true},
    expire_date: { type: String, required: true},
    expire_time: { type: String, required: true},
    imgName: { type: String, required: true},
    isExpired: {type: Boolean, required: true},
    bidders: { type: Array, required: true}
});

const Item = mongoose.model('itemSchema', itemSchema);

module.exports = Item;
