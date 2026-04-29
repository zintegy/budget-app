const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  tripId: {
    type: Schema.Types.ObjectId,
    ref: 'tripSchema',
    required: [true, "Trip ID is required"]
  },
  date: {
    type: Date,
    default: Date.now
  },
  vendor: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    default: 0
  },
  paidBy: {
    type: String,
    default: ''
  },
  equalSplit: {
    type: Boolean,
    default: false
  },
  splits: {
    type: Map,
    of: Number,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Expense = mongoose.model('expenseSchema', expenseSchema);

module.exports = Expense;
