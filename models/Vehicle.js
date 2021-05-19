const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const vehicleSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    vehicle_type: {
        type: String,
    },

    fuel: { liters: Number, cost: Number },
    driver: {
        id: { type: Schema.Types.ObjectId, ref: 'Driver' },
        name: String
    },
    notes: String,
    duration: String,
    fuels: [{
        bill: { type: Schema.Types.ObjectId, ref: 'Bill' },
        amount: Number,
        date: String,
        done: Boolean
    }],
    maintenance: [{
        bill: { type: Schema.Types.ObjectId, ref: 'Bill' },
        amount: Number,
        date: String,
        done: Boolean
    }],
    active: { default: true, type: Boolean }
});


module.exports = mongoose.model('Vehicle', vehicleSchema);
