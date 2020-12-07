const Account = require('../models/account');

const DbErrorHandler = require('../helpers/DbErrorHandler');

const AccountController = {};

AccountController.get= (req, res, next) => {
  Account.find(req.query) 
    .then(data => res.json(data))
    .catch(next);
};

AccountController.create = (req, res, next) => {
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

AccountController.addAmountToAccount = (id, amount) => {
  console.log("Adding " + amount + " to "+ id);
  Account.find({"_id": id})
    .then(data => {
      const sourceAccountEntity = data[0];
      let currentAmount = sourceAccountEntity.currentAmount;
      console.log("Account found with current amount of " + currentAmount);
      Account.findByIdAndUpdate(
        id, {"currentAmount": currentAmount + amount}
      ).then();
    })
};

module.exports = AccountController;
