const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const driverSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    address: {
        type: String,
    },
    image: String,
    personalId: String,
    resetToken: String,
    resetTokenExpr: Date,
    signUpToken: String,
    signUpTokenExpr: Date,
    note: String,
    shipments: [{
        id: { type: Schema.Types.ObjectId, ref: 'Shipment' },
        no: Number
    }],
    vehicle: {
        name: String,
        id: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
        fuel: Number,
    },
    salary: {
        commission: {
            type: Number,
            default: 0
        },
        base_salary: {
            type: Number,
            default: 0
        },
        bonus: {
            type: Number,
        },
        deduct: {
            type: Number,
        },
        annualBonus: {
            type: Number,
        },
        total: {
            type: Number
        }
    },
    commission: [{
        bill:{ type: Schema.Types.ObjectId, ref: 'Bill' },
        amount: Number,
        date: String,
        done: Boolean
    }],
    custody: [{
        bill:{ type: Schema.Types.ObjectId, ref: 'Bill' },
        amount: Number,
        date: String,
        done: Boolean
    }],
    isDriver: { default: true, type: Boolean }
});


module.exports = mongoose.model('Driver', driverSchema);
