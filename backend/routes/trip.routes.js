const express = require('express');
const router = express.Router();
const TripController = require('../controllers/trip.controller');

router.route('/trip')
  .get(TripController.getActive)
  .post(TripController.create);

router.route('/trip/:id/retire')
  .put(TripController.retire);

module.exports = router;
