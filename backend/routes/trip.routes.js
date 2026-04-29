const express = require('express');
const router = express.Router();
const TripController = require('../controllers/trip.controller');
const ExpenseController = require('../controllers/expense.controller');

router.route('/trip')
  .get(TripController.getActive)
  .post(TripController.create);

router.route('/trip/:id/retire')
  .put(TripController.retire);

router.route('/trip/:tripId/expense')
  .get(ExpenseController.getByTrip)
  .post(ExpenseController.create);

router.route('/trip/:tripId/expense/:id')
  .put(ExpenseController.update)
  .delete(ExpenseController.delete);

module.exports = router;
