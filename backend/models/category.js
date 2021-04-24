const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema for individual category
const categorySchema = new Schema({
  categoryType: {
    type: String,
    enum: ["Expense", "Income"],
    required: [true, "Category type is invalid"]
  },

  categoryName: {
    type: String,
    required: [true, "Category name is invalid"]
  },

  isNecessity: {
    type: Boolean,
    default: false,
  },

  monthlyBudget: {
    type: Map,
    of: {type: Map, of: Number},
  },

  monthlySpend: {
    type: Map,
    of: {type: Map, of: Number},
    default: new Map()
  },
})




// create model for category
const Category = mongoose.model('categorySchema', categorySchema);

module.exports = Category;

