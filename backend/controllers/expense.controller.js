const Expense = require('../models/expense');

const ExpenseController = {};

ExpenseController.getByTrip = (req, res, next) => {
  Expense.find({ tripId: req.params.tripId })
    .sort({ order: 1, createdAt: 1 })
    .then(data => res.json(data))
    .catch(next);
};

ExpenseController.create = (req, res, next) => {
  Expense.countDocuments({ tripId: req.params.tripId })
    .then(count => {
      return Expense.create({ ...req.body, tripId: req.params.tripId, order: count });
    })
    .then(data => res.json(data))
    .catch(next);
};

ExpenseController.reorder = (req, res, next) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'orderedIds must be an array' });
  }
  const ops = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index } },
    },
  }));
  Expense.bulkWrite(ops)
    .then(() => res.json({ success: true }))
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
