const Txn = require('../models/txn');

const DbErrorHandler = require('../helpers/DbErrorHandler');

const TxnController = {};

TxnController.search = (req, res, next) => {
  if (req.query.merchant) {
    req.query.capitalMerchant = req.query.merchant;
  }
  Txn.find(req.query)
    .then(data => res.json(data))
    .catch(next);
};

TxnController.create = (req, res, next) => {
  if (req.body.txnType != "Expense") {
    req.body.merchant = null;
  }

  if (req.body.txnType != "Income") {
    req.body.expenseCategory = null;
  }

  if (req.body.txnType != "Transfer") {
    req.body.sourceAccount = null;
  }
  else {
    req.body.category = null;
  }


  if (req.body.merchant) {
    req.body.capitalMerchant = req.body.merchant;
  }
    Txn.create(req.body)
    .then(data => res.json(data))
    .catch(data => {
      res.json(
        {"errors": 
          DbErrorHandler.translateError(data["errors"])}
      );
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
