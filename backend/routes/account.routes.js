const express = require('express');
const router = express.Router();
const Account = require('../models/account');
const AccountController = require('../controllers/account.controller');

// search transactions 
router.route('/account')
  .get(AccountController.get)
  .post(AccountController.create);

router.route('/account/:id')
  .delete(AccountController.delete)
  .put(AccountController.update);

router.delete('/account/:id', (req, res, next) => {
  Account.findOneAndDelete({"_id": req.params.id})
    .then(data => res.json(data))
    .catch(data => res.json({"error": "Not deleted."}))
});

router.put('/account/:id', (req, res, next) => {
  Account.findByIdAndUpdate(req.params.id, req.body)
    .then(data => res.json(data))
    .catch(data => res.json(data))
});

module.exports = router;

