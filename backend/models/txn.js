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
    required: [
      function() {return this.txnType == "Expense"}, 
      "Merchant is required"
    ]
  },
  destinationAccount : {
    type : String,
    required: [
      function() {return this.txnType != "Expense"}, 
      "Destination account is required"
    ]
  },

  description : {
    type: String
  },

  incomeCategory : {
    type: String,
    required: [
      function() {
        return this.txnType == "Income" && !this.expenseCategory;
      }, 
      "Income or expense category is required"
    ]
  },

  expenseCategory : {
    type: String, 
    required: [
      function() {return this.txnType == "Expense" || (
        this.txnType == "Income" && !this.incomeCategory);}, 
      "Expense category is required"],
    validate: [function(val) {
      return !val || !this.incomeCategory;
    }, "Can't enter both expense category and income category"]
  },

  sourceAccount : {
    type: String, 
    required: [
      function() {return this.txnType != "Income"}, 
      "Source account is required"
    ]
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

