const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        mobile: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        image: {
            type: String
        },
        isAdmin: {type:Boolean, default:true},
        role: { type: String },
        company:{
            type:mongoose.Types.ObjectId,
            ref:'company'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
