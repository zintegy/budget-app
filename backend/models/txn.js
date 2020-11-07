const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema for individual txnr
const txnSchema = new Schema({
  txnType : {
    type : String,
    enum : ["Expense", "Income", "Transfer"],
    required: [true, "Txn type is required"]
  },
  txnDate : {
    type : Date,
    required: [true, "Date is required"]
  },
  amount : {
    type : Number,
    required: [true, "Amount is required"]
  },
  merchant : {
    type : String, 
    required: [function() {return this.txnType == "Expense"}, "Merchant is required"]
  },
  account : {
    type : String,
    required: [true, "Account is required"]
  },

  description : {
    type: String
  },

  category : {
    type: String,
    required: [function() {
      return this.txnType == "Expense" || (
        this.txnType == "Income" && this.expenseCategory == "");
      }, "Category is required"]
  },

  expenseCategory : {
    type: String, 
    required: [
      function() {return this.txnType == "Income" && this.category == "";}, 
      "Expense category is required"],
    validate: [function(val) {
      return val == undefined || this.category == undefined;
    }, "Can't enter both expense category and income category"]
  },

  sourceAccount : {
    type: String, 
    required: [function() {return this.txnType == "Transfer"}, "Source account is required"]
  },

  /* hidden ones */
  capitalMerchant : {
    type : String,
    uppercase: true,
    required: function() {return this.txnType == "Expense"}
  }
});
      

// create model for txn
const Txn = mongoose.model('txnSchema', txnSchema);

module.exports = Txn;

