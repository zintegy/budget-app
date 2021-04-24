const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema for individual account
const accountSchema = new Schema({
  accountType : {
    type : String,
    enum : ["CC", "Checking", "Savings", "Merchant Credit"],
    required: [true, "Account type is invalid"]
  },
  accountName: {
    type : String,
    required: [true, "Account name is required"]
  },
  startingAmount: {
    type: Number,
  },
  currentAmount: {
    type: Number, 
    required: [true, "Current amount is required"]
  },
  lastTxnDate: {
    type: Date
  },
  monthlyDelta: {
    type: Map,
    of: {type: Map, of: Number},
    default: new Map()
  },
  isLiquid: {
    type: Boolean,
    default: true,
  },
});
      

// create model for account
const Account = mongoose.model('accountSchema', accountSchema);

module.exports = Account;

