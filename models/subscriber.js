const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const subscriberSchema = new Schema({
    mobile: {
        type: String,
        required: true
    },
    name: String,
    date: String,
    message: String
})

module.exports = mongoose.model('Subscribers', subscriberSchema);

