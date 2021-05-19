const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  company_name: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  email: {
    type: String,
  },
  address: {
    type: String,
  },
  additional_info: String,
  resetToken: String,
  resetTokenExpr: Date,
  signUpToken: String,
  signUpTokenExpr: Date,
  integrationTokens:[{
    name:String,
    token:String,
    used:Number
  }],
  shipments: [{ type: Schema.Types.ObjectId, ref: 'Shipment' }],
});


module.exports = mongoose.model('User', userSchema);
