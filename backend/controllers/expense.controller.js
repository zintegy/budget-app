const Expense = require('../models/expense');

const ExpenseController = {};

ExpenseController.getByTrip = (req, res, next) => {
  Expense.find({ tripId: req.params.tripId })
    .sort({ createdAt: 1 })
    .then(data => res.json(data))
    .catch(next);
};

ExpenseController.create = (req, res, next) => {
  Expense.create({ ...req.body, tripId: req.params.tripId })
    .then(data => res.json(data))
    .catch(next);
};

ExpenseController.update = (req, res, next) => {
  Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .then(data => {
      if (!data) return res.status(404).json({ error: 'Expense not found' });
      res.json(data);
    })
    .catch(next);
};

ExpenseController.delete = (req, res, next) => {
  Expense.findByIdAndDelete(req.params.id)
    .then(data => {
      if (!data) return res.status(404).json({ error: 'Expense not found' });
      res.json(data);
    })
    .catch(next);
};

module.exports = ExpenseController;
