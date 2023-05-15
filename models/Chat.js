const mongoose = require('mongoose');

const Schema = mongoose.Schema;



const chatSchema = new Schema({
    chatId: Number,
    driver: { type: Schema.Types.ObjectId, ref: 'Driver' },
    admin: { type: Schema.Types.ObjectId, ref: 'Admin' },
    conversion: [{
        usertype:Number,
        msg: String,
        sender: { type: Schema.Types.ObjectId, ref: 'OnModel' },
        reciver: { type: Schema.Types.ObjectId, ref: 'OnModel' },
        date: { time: String, date: String },
    }],
    active: { default: true, type: Boolean }
});



module.exports = mongoose.model('Chat', chatSchema);
