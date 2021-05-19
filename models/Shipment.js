const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');

const connection = mongoose.createConnection(`mongodb+srv://abdelrhman:ingodwetrust@onlineshop-zsiuv.mongodb.net/carryit`);

autoIncrement.initialize(connection);

const shipmentSchema = new Schema({
    shipmentNo: Number,
    serialNo: Number,

    user: { type: Schema.Types.ObjectId, ref: 'User' },
    pickup: {
        zone: { name: String, zoneId: Number },
        address: String,
        building: Number,
        apartment: Number,
        floor: Number,
        name: String,
        phone: String,
        alternative_number: String,
    },
    receiver: {
        zone: { name: String, zoneId: Number },
        address: String,
        building: Number,
        apartment: Number,
        floor: Number,
        name: String,
        phone: String,
        alternative_number: String,
    },
    quantity: {
        type: Number,
    },
    price: {
        type: Number,
    },
    refunded: Boolean,
    status: {
        no: Number,
        text: String,
        note: String,
        reason: String,
    },
    delivery_date: String,
    pickup_date: String,
    notes: String,
    shipping_price: Number,
    total_price: Number,
    date: String,
    is_liquid: Boolean,
    is_fragile: Boolean,
    dimensions: {
        height: Number,
        width: Number,
        weight: Number
    },
    driver: {
        name: String,
        mobile: String,
        id: { type: Schema.Types.ObjectId, ref: 'OnModel' },
        assignedAt: String
    },
    payment_terms: String,
    customerId: String,
    creator: {
        name: String,
        id: { type: Schema.Types.ObjectId, ref: 'OnModel' }

    },
}, { timestamps: true });

shipmentSchema.plugin(autoIncrement.plugin, {
    model: 'Shipment',
    field: 'shipmentNo',
    startAt: 10000,
    incrementBy: 1
});
module.exports = mongoose.model("Shipment", shipmentSchema);