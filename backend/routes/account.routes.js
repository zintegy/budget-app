const express = require('express');
const router = express.Router();
const Account = require('../models/account');
const AccountController = require('../controllers/account.controller');

router.route('/account')
  .get(AccountController.get)
  .post(AccountController.create);

router.route('/account/:id')
  .delete(AccountController.delete)
  .put(AccountController.update);

module.exports = router;

