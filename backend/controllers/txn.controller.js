const Txn = require('../models/txn');
const Account = require('../models/account');
const DbErrorHandler = require('../helpers/DbErrorHandler');

const TxnController = {};

TxnController.search = (req, res, next) => {
  if (req.query.merchant) {
    req.query.capitalMerchant = req.query.merchant;
  }
  Txn.find(req.query).sort([["txnDate", -1]])
    .then(data => res.json(data))
    .catch(next);
};

TxnController.create = (req, res, next) => {
  const txnType = req.body.txnType;
  if (txnType != "Expense") {
    req.body.merchant = null;
  }

  if (txnType == "Expense") {
    req.body.account = null;
  }
  if (txnType != "Income") {
    req.body.expenseCategory = null;
  }

  if (txnType == "Income") {
    req.body.sourceAccount = null;
  }

  if (txnType == "Transfer") {
    req.body.category = null;
  }

  if (req.body.merchant) {
    req.body.capitalMerchant = req.body.merchant;
  }
  console.log("Request body:");
  console.log(req.body);

  return Txn.create(req.body)
    .then(data => {res.json(data); return true;
    })
    .catch(data => {
      res.json(
        {"errors": DbErrorHandler.translateError(data["errors"])}
      );
      return false;
    })
};

TxnController.delete = (req, res, next) => {
  Txn.findOneAndDelete({"_id": req.params.id})
    .then(data => res.json(data))
    .catch(data => res.json({"error": "Not deleted."}))
};

TxnController.update = (req, res, next) => {
  if (req.body.merchant) {
    req.body.capitalMerchant = req.body.merchant;
  }
  Txn.findByIdAndUpdate(req.params.id, req.body)
    .then(data => res.json(data))
    .catch(data => res.json(data))
};

module.exports = TxnController;
