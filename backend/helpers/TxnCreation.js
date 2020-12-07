const TxnController = require('../controllers/txn.controller');
const AccountController = require('../controllers/account.controller');
const mongoose = require('mongoose');

function createTxn(req, res, next) {
  //try: put these in a single transaction
  

   

  const txn = TxnController.create(req, res, next)
    .then(success => {
      if (success) {
        const txnType = req.body.txnType;
        const amount = parseFloat(req.body.amount);
        if (txnType != "Income") {
          AccountController.addAmountToAccount(
            req.body.sourceAccount, -1*amount);
        }
        if (txnType != "Expense") {
          AccountController.addAmountToAccount(
            req.body.account, amount);
        }
        console.log("Commited changes!")
      }
      else {
        console.log("Txn error. Did not make changes.");
      
      }
    }
  );
}

module.exports = {createTxn};
