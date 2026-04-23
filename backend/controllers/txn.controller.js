const Txn = require('../models/txn');
const Account = require('../models/account');
const DbErrorHandler = require('../helpers/DbErrorHandler');

const TxnController = {};

TxnController.search = (req, res, next) => {
  const { year, cursorDate, cursorId, limit, ...query } = req.query;

  if (query.merchant) {
    query.capitalMerchant = query.merchant;
  }

  const filter = { ...query };

  if (year) {
    const y = parseInt(year);
    filter.txnDate = {
      $gte: new Date(Date.UTC(y, 0, 1)),
      $lt: new Date(Date.UTC(y + 1, 0, 1))
    };
  }

  if (cursorDate && cursorId) {
    const cursorFilter = {
      $or: [
        { txnDate: { $lt: new Date(cursorDate) } },
        { txnDate: new Date(cursorDate), _id: { $lt: cursorId } }
      ]
    };
    if (filter.txnDate) {
      filter.$and = [{ txnDate: filter.txnDate }, cursorFilter];
      delete filter.txnDate;
    } else {
      Object.assign(filter, cursorFilter);
    }
  }

  const maxResults = parseInt(limit) || 100;

  Promise.all([
    Txn.find(filter).sort([["txnDate", -1], ["_id", -1]]).limit(maxResults),
    Txn.countDocuments(year ? {
      txnDate: {
        $gte: new Date(Date.UTC(parseInt(year), 0, 1)),
        $lt: new Date(Date.UTC(parseInt(year) + 1, 0, 1))
      }
    } : query)
  ])
    .then(([txns, totalCount]) => res.json({ txns, totalCount }))
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
    req.body.incomeCategory = null;
  }

  if (txnType == "Income") {
    req.body.sourceAccount = null;
  }

  if (txnType == "Transfer") {
    req.body.expenseCategory = null;
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
  return Txn.findOneAndDelete({"_id": req.params.id})
    .then(data => {res.json(data); return data})
    .catch(data => {res.json({"error": "Not deleted."}); return {"error": "Not deleted"}})
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
