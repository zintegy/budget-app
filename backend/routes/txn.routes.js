const express = require('express');
const router = express.Router();
const Txn = require('../models/txn');
const TxnController = require('../controllers/txn.controller');

// search transactions 
router.route('/txn')
  .get(TxnController.search)
  .post(TxnController.create);

router.route('/txn/:id')
  .delete(TxnController.delete)
  .put(TxnController.update);

router.delete('/txn/:id', (req, res, next) => {
  Txn.findOneAndDelete({"_id": req.params.id})
    .then(data => res.json(data))
    .catch(data => res.json({"error": "Not deleted."}))
});

router.put('/txn/:id', (req, res, next) => {
  if (req.body.merchant) {
    req.body.capitalMerchant = req.body.merchant;
  }
  Txn.findByIdAndUpdate(req.params.id, req.body)
    .then(data => res.json(data))
    .catch(data => res.json(data))
});

module.exports = router;

