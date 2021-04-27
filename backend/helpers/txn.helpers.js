const TxnController = require('../controllers/txn.controller');
const AccountController = require('../controllers/account.controller');
const CategoryController = require('../controllers/category.controller');
const mongoose = require('mongoose');
const rounder = require('./rounder');

function createTxn(req, res, next) {
  //try: put these in a single transaction
  TxnController.create(req, res, next)
    .then(success => {
      if (success) {
        const txnType = req.body.txnType;
        const amount = parseFloat(req.body.amount)

        const txnDate = new Date(req.body.txnDate);

        if (txnType != "Income") {
          AccountController.addAmountToAccount(
            req.body.sourceAccount, -1*amount, txnDate);
        }
        if (txnType != "Expense") {
          AccountController.addAmountToAccount(
            req.body.destinationAccount, amount, txnDate);
        }


        if (txnType == "Expense") {
          const category = req.body.expenseCategory;
          CategoryController.addAmountToCategory(category, amount, txnDate);
        }
        if (txnType == "Income") {
          let category = req.body.expenseCategory;
          if (!category) category = req.body.incomeCategory;
          CategoryController.addAmountToCategory(category, -1*amount, txnDate);
        }

        console.log("Commited changes!")
      }
      else {
        console.log("Txn error. Did not make changes.");

      }
    }
  );
}

function deleteTxnAndUpdateAccount(req, res, next) {
console.log("test");

  TxnController.delete(req, res, next)
    .then(response => {
      if (!!response.error) {
        console.log("error occurred");
        return;
      }

      const txnDate = new Date(response.txnDate);
      console.log(txnDate);
      console.log(response)

      const txnType = response.txnType;
      const amount = response.amount;
      if (txnType != "Income") {
        AccountController.addAmountToAccount(
          response.sourceAccount, amount, txnDate);
      }
      if (txnType != "Expense") {
        AccountController.addAmountToAccount(
          response.destinationAccount, -1*amount, txnDate);
      }


      if (txnType == "Expense") {
        const category = response.expenseCategory;
        CategoryController.addAmountToCategory(category, -1*amount, txnDate);
      }
      if (txnType == "Income") {
        let category = response.expenseCategory;
        if (!category) category = response.incomeCategory;
        CategoryController.addAmountToCategory(category, amount, txnDate);
      }
  })


}




module.exports = {createTxn, deleteTxnAndUpdateAccount};
