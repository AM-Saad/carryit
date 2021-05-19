const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    isEmp: Boolean,
    name: {
        type: String,
    },
    mobile: {
        type: String,
    },
    email: {
        type: String
    },
    address: {
        type: String
    },
    password: {
        type: String
    },
    advanced: {
        department: {
            id: {
                type: Schema.Types.ObjectId,
                ref: 'company',
            },
            name: String,

        },
        position: {
            type: String,
        },
        salary: {
            baseSalary: {
                type: Number,
            },
            bonus: {
                type: Number,
                default: 0
            },
            deduct: {
                type: Number,
                default: 0
            },
            annualBonus: {
                type: Number,
                default: 0
            },
            total: {
                type: Number
            }
        },
        roles: [],
        degree: Boolean,
        age: Number,
        educations: [],
        cv: String,
        image: String,
        notes: String,

    },
    targets: [
        {
            month: String,
            info: {
                sales: Number,
                deals: Number
            },
            result: {
                sales: Number,
                deals: Number
            }
        }
    ],


    role: {
        type: String,
    },

});

module.exports = mongoose.model("Employee", employeeSchema);
