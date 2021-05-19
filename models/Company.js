const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const companySchema = new Schema({

    owner: {
        name: String, id: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
        }
    },
    name: {
        type: String,
        required: true
    },
    logo:String,
    email: {
        type: String,
    },
    mobile: {
        type: String,
    },
    address: {
        type: String,
    },

    subscriptions: {
        activated: { type: Boolean, default: true },
        trial: Boolean,
        duration: {
            from: String,
            to: String
        },
        history: {
            activation_counts: { type: Number, default: 0 },
            dates: [{
                data: String,
                status: Boolean
            }]
        },

    },
    database: {
        url: String,
        name: String,
        password: String
    },
    secretKey: Number,
    roles: [
        {
            name: String,
            permissions: [
                {
                    name: String,
                    actions: []
                }
            ]
        },
    ],
    departments: [
        {
            depName: String,
            manager: {
                type: Schema.Types.ObjectId,
                ref: 'Employee',
            },
            subDep: {
                depName: String,
                manager: {
                    type: Schema.Types.ObjectId,
                    ref: 'Employee',
                }
            },
            positions: [
                {
                    type: String,
                }
            ],
            employees: [
                {
                    id: {
                        type: Schema.Types.ObjectId,
                        ref: 'Esmployee'
                    },
                    name: String,
                }
            ]
        }
    ],
    targets: [
        {
            month: String,
            info: {
                sales: Number,
                deals: Number
            },
            description: String

        }
    ],
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);
