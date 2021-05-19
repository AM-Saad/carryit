const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const autoIncrement = require('mongoose-auto-increment');
const connection = mongoose.createConnection(`mongodb+srv://abdelrhman:ingodwetrust@onlineshop-zsiuv.mongodb.net/carryit`);
autoIncrement.initialize(connection);


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

chatSchema.plugin(autoIncrement.plugin, {
    model: 'Chat',
    field: 'chatId',
    startAt: 10000,
    incrementBy: 1
});

module.exports = mongoose.model('Chat', chatSchema);
