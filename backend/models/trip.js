const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripSchema = new Schema({
  name: {
    type: String,
    required: [true, "Trip name is required"]
  },
  members: {
    type: [String],
    validate: {
      validator: v => v.length >= 2,
      message: "A trip must have at least 2 members"
    }
  },
  status: {
    type: String,
    enum: ["active", "retired"],
    default: "active"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Trip = mongoose.model('tripSchema', tripSchema);

module.exports = Trip;
