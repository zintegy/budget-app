const AccountController = require('../controllers/account.controller');
const CategoryController = require('../controllers/category.controller');
const Txn = require('../models/txn');
const DbErrorHandler = require('./DbErrorHandler');
const rounder = require('./rounder');

function createTxn(req, res, next) {
  const txnType = req.body.txnType;
  if (txnType != "Expense") req.body.merchant = null;
  if (txnType == "Expense") req.body.account = null;
  if (txnType != "Income") req.body.incomeCategory = null;
  if (txnType == "Income") req.body.sourceAccount = null;
  if (txnType == "Transfer") req.body.expenseCategory = null;
  if (req.body.merchant) req.body.capitalMerchant = req.body.merchant;

  Txn.create(req.body)
    .then(data => {
      return applyEffects(data).then(() => {
        res.json(data);
      });
    })
    .catch(data => {
      res.json({ "errors": DbErrorHandler.translateError(data["errors"]) });
    });
}

function deleteTxnAndUpdateAccount(req, res, next) {
  Txn.findOneAndDelete({ "_id": req.params.id })
    .then(data => {
      if (!data) {
        res.json({ "error": "Not found." });
        return;
      }
      return reverseEffects(data).then(() => {
        res.json(data);
      });
    })
    .catch(() => {
      res.json({ "error": "Not deleted." });
    });
}




function reverseEffects(txn) {
  const txnDate = new Date(txn.txnDate);
  const amount = txn.amount;
  const txnType = txn.txnType;
  const promises = [];

  if (txnType != "Income") {
    promises.push(AccountController.addAmountToAccount(txn.sourceAccount, amount, txnDate));
  }
  if (txnType != "Expense") {
    promises.push(AccountController.addAmountToAccount(txn.destinationAccount, -1 * amount, txnDate));
  }
  if (txnType == "Expense") {
    promises.push(CategoryController.addAmountToCategory(txn.expenseCategory, -1 * amount, txnDate));
  }
  if (txnType == "Income") {
    let category = txn.expenseCategory || txn.incomeCategory;
    promises.push(CategoryController.addAmountToCategory(category, amount, txnDate));
  }
  return Promise.all(promises);
}

function applyEffects(txn) {
  const txnDate = new Date(txn.txnDate);
  const amount = parseFloat(txn.amount);
  const txnType = txn.txnType;
  const promises = [];

  if (txnType != "Income") {
    promises.push(AccountController.addAmountToAccount(txn.sourceAccount, -1 * amount, txnDate));
  }
  if (txnType != "Expense") {
    promises.push(AccountController.addAmountToAccount(txn.destinationAccount, amount, txnDate));
  }
  if (txnType == "Expense") {
    promises.push(CategoryController.addAmountToCategory(txn.expenseCategory, amount, txnDate));
  }
  if (txnType == "Income") {
    let category = txn.expenseCategory || txn.incomeCategory;
    promises.push(CategoryController.addAmountToCategory(category, -1 * amount, txnDate));
  }
  return Promise.all(promises);
}

function updateTxn(req, res, next) {
  const id = req.params.id;

  Txn.findById(id)
    .then(oldTxn => {
      if (!oldTxn) {
        return res.status(404).json({ error: "Transaction not found." });
      }

      // Reverse old transaction's effects, then update and apply new
      return reverseEffects(oldTxn).then(() => {

      const updates = {};
      if (req.body.amount !== undefined) updates.amount = parseFloat(req.body.amount);
      if (req.body.txnDate !== undefined) updates.txnDate = req.body.txnDate;
      if (req.body.description !== undefined) updates.description = req.body.description;

      // Fields conditional on txnType
      const txnType = oldTxn.txnType;
      if (txnType === "Expense") {
        if (req.body.merchant !== undefined) {
          updates.merchant = req.body.merchant;
          updates.capitalMerchant = req.body.merchant;
        }
        if (req.body.sourceAccount !== undefined) updates.sourceAccount = req.body.sourceAccount;
        if (req.body.expenseCategory !== undefined) updates.expenseCategory = req.body.expenseCategory;
      }
      if (txnType === "Income") {
        if (req.body.destinationAccount !== undefined) updates.destinationAccount = req.body.destinationAccount;
        if (req.body.expenseCategory !== undefined) updates.expenseCategory = req.body.expenseCategory;
        if (req.body.incomeCategory !== undefined) updates.incomeCategory = req.body.incomeCategory;
      }
      if (txnType === "Transfer") {
        if (req.body.sourceAccount !== undefined) updates.sourceAccount = req.body.sourceAccount;
        if (req.body.destinationAccount !== undefined) updates.destinationAccount = req.body.destinationAccount;
      }

      return Txn.findByIdAndUpdate(id, updates, { new: true })
        .then(updatedTxn => {
          return applyEffects(updatedTxn).then(() => {
            res.json(updatedTxn);
          });
        });
      }); // end reverseEffects
    })
    .catch(err => {
      console.log("Update error:", err);
      res.status(500).json({ error: "Failed to update transaction." });
    });
}

module.exports = {createTxn, deleteTxnAndUpdateAccount, updateTxn};
