const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');

const connection = mongoose.createConnection(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@onlineshop-zsiuv.mongodb.net/${process.env.DATABASE_URL}`);

autoIncrement.initialize(connection);

const billSchema = new Schema({

    billtype: String,
    category: String,
    user: {
        id: {
            type: Schema.Types.ObjectId,
            refPath: 'OnModel'
        },
        name: String,
    },
    itemId: {
        type: Schema.Types.ObjectId,
        refPath: 'OnModel'
    },
    itemname: String,
    notes: String,
    amount: Number,
    total: Number,
    date: String,
    due: String,
    release_date: String,
    status: {
        paid: Boolean,
        note: String,
        date: String,
        changedBy: {
            id: {
                type: Schema.Types.ObjectId,
                refPath: 'OnModel'
            },
            name: String,
        }
    },
    creator: {
        name: String,
        id: { type: Schema.Types.ObjectId, ref: 'OnModel' }
    },



}, { timestamps: true });
billSchema.plugin(autoIncrement.plugin, {
    model: 'bill',
    field: 'serialNo',
    startAt: 10000,
    incrementBy: 1
});

module.exports = mongoose.model("Bill", billSchema);
