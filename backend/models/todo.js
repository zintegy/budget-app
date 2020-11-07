const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema for todo


const todoSchema = new Schema({
  action: {
    type: String,
    required: [true, 'The todo text field is required']
  }
});

// create model for todo
const Todo = mongoose.model('todo', todoSchema);

module.exports = Todo;

