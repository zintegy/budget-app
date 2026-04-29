const Trip = require('../models/trip');
const DbErrorHandler = require('../helpers/DbErrorHandler');

const TripController = {};

TripController.getActive = (req, res, next) => {
  Trip.find({ status: "active" })
    .then(data => res.json(data))
    .catch(next);
};

TripController.create = (req, res, next) => {
  Trip.find({ status: "active" })
    .then(activeTrips => {
      if (activeTrips.length > 0) {
        return res.status(400).json({ error: "An active trip already exists. Retire it first." });
      }
      return Trip.create(req.body)
        .then(data => res.json(data))
        .catch(err => {
          if (err.errors) {
            res.status(400).json(
              { "errors": DbErrorHandler.translateError(err["errors"]) }
            );
          } else {
            res.status(500).json({ error: err.message || "Failed to create trip." });
          }
        });
    })
    .catch(next);
};

TripController.retire = (req, res, next) => {
  Trip.findByIdAndUpdate(req.params.id, { status: "retired" })
    .then(data => res.json(data))
    .catch(next);
};

module.exports = TripController;
