const Account = require('../models/account');
const rounder = require('../helpers/rounder');
const DbErrorHandler = require('../helpers/DbErrorHandler');

const AccountController = {};

AccountController.get= (req, res, next) => {
  Account.find(req.query).sort([["lastTxnDate", -1], ["accountType"], ["accountName"]])
    .then(data => res.json(data))
    .catch(next);
};

AccountController.create = (req, res, next) => {
  req.body.currentAmount = req.body.startingAmount;

  Account.create(req.body)
    .then(data => res.json(data))
    .catch(data => {
      res.json(
        {"errors": 
          DbErrorHandler.translateError(data["errors"])}
      );
    })
};

AccountController.delete = (req, res, next) => {
  Account.findOneAndDelete({"_id": req.params.id})
    .then(data => res.json(data))
    .catch(data => res.json({"error": "Not deleted."}))
};

AccountController.update = (req, res, next) => {
  Account.findByIdAndUpdate(req.params.id, req.body)
    .then(data => res.json(data))
    .catch(data => res.json(data))
};

AccountController.addAmountToAccount = (id, amount, date) => {
  const month = date.getMonth().toString();
  const year = date.getFullYear().toString();

  Account.find({"_id": id})
    .then(data => {
      const sourceAccountEntity = data[0];
      const monthlyDelta = sourceAccountEntity.monthlyDelta;

      // first transaction in the year
      if (!monthlyDelta.has(year)) {
        monthlyDelta.set(year, new Map());
        for (var allMonths = 0; allMonths < 12; allMonths++) {
          monthlyDelta.get(year).set(allMonths.toString(), 0);
        }
      }
      // should never happen, populate month if doesn't exist
      if (!monthlyDelta.get(year).has(month)) {
        monthlyDelta.get(year).set(month, 0);
      }

      let currentAmount = sourceAccountEntity.currentAmount;
      let monthlyAmount = monthlyDelta.get(year).get(month);
      monthlyDelta.get(year).set(month, rounder.currencyRound(monthlyAmount + amount));

      let lastTxnDate = sourceAccountEntity.lastTxnDate;
      if (lastTxnDate < date) lastTxnDate = date;

      Account.findByIdAndUpdate(
        id, 
        {
          "currentAmount": rounder.currencyRound(currentAmount + amount), 
          "monthlyDelta": monthlyDelta,
          "lastTxnDate": lastTxnDate
        }
      ).then(); // for some reason i need this .then(), otherwise the account deosn't update
    })
};

module.exports = AccountController;
