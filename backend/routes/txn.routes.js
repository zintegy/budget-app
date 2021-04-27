const express = require('express');
const router = express.Router();
const Txn = require('../models/txn');
const TxnController = require('../controllers/txn.controller');
const TxnHelper = require('../helpers/txn.helpers');

// search transactions
router.route('/txn')
  .get(TxnController.search)
  .post(TxnHelper.createTxn);

router.route('/txn/:id')
  .delete(TxnHelper.deleteTxnAndUpdateAccount)
  .put(TxnController.update);

module.exports = router;

