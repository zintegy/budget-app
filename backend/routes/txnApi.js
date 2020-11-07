const express = require('express');
const router = express.Router();
const Txn = require('../models/txn');

// search transactions 
router.get('/txn', (req, res, next) => {
  if (req.query.merchant) {
    req.query.capitalMerchant = req.query.merchant;
  }
  Txn.find(req.query) 
    .then(data => res.json(data))
    .catch(next)
});

router.post('/txn', (req, res, next) => {
  if (req.body.merchant) {
    req.body.capitalMerchant = req.body.merchant;
  }
  Txn.create(req.body)
    .then(data => res.json(data))
    .catch(data => {
      let errors = {};
      console.log(data["errors"]);
      Object.entries(data["errors"]).forEach(
        entry => {
          const [key, value] = entry;
          errors[key] = value["message"];
        });
      res.json({"errors": errors});
    })
});

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

