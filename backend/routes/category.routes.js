const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const CategoryController = require('../controllers/category.controller');

// search transactions 
router.route('/category')
  .get(CategoryController.get)
  .post(CategoryController.create);

router.route('/category/:id')
  .delete(CategoryController.delete)
  .put(CategoryController.update);

module.exports = router;

