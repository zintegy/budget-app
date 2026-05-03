const Trip = require('../models/trip');
const Expense = require('../models/expense');
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

TripController.updateMembers = (req, res, next) => {
  const { members, currency } = req.body;
  if (!Array.isArray(members) || members.length < 2) {
    return res.status(400).json({ error: "A trip must have at least 2 members." });
  }

  const updateFields = { members };
  if (currency !== undefined) updateFields.currency = currency;

  Trip.findById(req.params.id)
    .then(trip => {
      if (!trip) return res.status(404).json({ error: "Trip not found." });

      const removed = trip.members.filter(m => !members.includes(m));
      if (removed.length === 0) {
        return Trip.findByIdAndUpdate(req.params.id, updateFields, { new: true })
          .then(updated => res.json(updated));
      }

      return Expense.find({ tripId: req.params.id }).then(expenses => {
        for (const name of removed) {
          for (const exp of expenses) {
            if (exp.paidBy === name) {
              return res.status(400).json({
                error: `Cannot remove "${name}" — they are listed as payer on expense "${exp.vendor || exp.description || exp._id}".`
              });
            }
            if (exp.splits && exp.splits.get(name) && exp.splits.get(name) !== 0) {
              return res.status(400).json({
                error: `Cannot remove "${name}" — they have a non-zero split on expense "${exp.vendor || exp.description || exp._id}".`
              });
            }
          }
        }
        return Trip.findByIdAndUpdate(req.params.id, updateFields, { new: true })
          .then(updated => res.json(updated));
      });
    })
    .catch(next);
};

module.exports = TripController;
