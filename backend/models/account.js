const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema for individual account
const accountSchema = new Schema({
  accountType : {
    type : String,
    enum : ["CC", "Checking", "Savings", "Merchant Credit"],
    required: [true, "Account type is required"]
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
  monthlySpend: {
    type: Number
  },
  isLiquid: {
    type: Boolean
  },
});
      

// create model for account
const Account = mongoose.model('accountSchema', accountSchema);

module.exports = Account;

