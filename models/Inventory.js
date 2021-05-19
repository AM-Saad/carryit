
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const inventorySchema = new Schema({
    info: { name: String, address: String, phone: String },
    items: [{
        id: { type: Schema.Types.ObjectId, ref: 'Shipment' },
        shipmentNo: Number,
        price: Number,
        entry_date: String,
        status: { text: String, no: Number },
        leaved_date: String,
        changed_date: String,
        by: { name: String, id: { type: Schema.Types.ObjectId, ref: 'OnModel' } },
        notes: String,
        in: Boolean,
        history: [{
            by: { name: String, id: { type: Schema.Types.ObjectId, ref: 'OnModel' } },
            status: { text: String, no: Number },
            date: String,

        }]
    }],
    active: Boolean,
    createdAt: String,
    locked: Boolean,
    pin: String,
})


module.exports = mongoose.model("Inventory", inventorySchema);
