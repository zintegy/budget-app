const Category = require('../models/category');

const rounder = require('../helpers/rounder');
const DbErrorHandler = require('../helpers/DbErrorHandler');

const CategoryController = {};

CategoryController.get = (req, res, next) => {
  Category.find(req.query).sort([["categoryName"]])
    .then(data => res.json(data))
    .catch(next);
};

CategoryController.create = (req, res, next) => {
  Category.create(req.body)
    .then(data => res.json(data))
    .catch(data => {
      res.json(
        {"errors":
          DbErrorHandler.translateError(data["errors"])}
      );
    })
};

CategoryController.delete = (req, res, next) => {
  Category.findOneAndDelete({"_id": req.params.id})
    .then(data => res.json(data))
    .catch(data => res.json({"error": "Not deleted."}))
};

CategoryController.update = (req, res, next) => {
  Category.findByIdAndUpdate(req.params.id, req.body)
    .then(data => res.json(data))
    .catch(data => res.json(data))
};

CategoryController.addAmountToCategory = (categoryName, amount, date) => {
  const month = date.getUTCMonth().toString();
  const year = date.getUTCFullYear().toString();

  console.log("Adding " + amount + " to " + categoryName);
  Category.find({"categoryName": categoryName})
    .then(data => {
      console.log(date)
      console.log(month)
      console.log(year)
      console.log(date.getDate())
      const categoryEntity = data[0];
      const monthlySpend = categoryEntity.monthlySpend;
      // if this is the first transaction in this year, create the new monthly map
      if (!monthlySpend.has(year)) {
        monthlySpend.set(year, new Map());
        for (var allMonths = 0; allMonths < 12; allMonths++) {
          monthlySpend.get(year).set(allMonths.toString(), 0);
        }
      }
      // should never happen.. but populate the month if it doesn't exist
      if (!monthlySpend.get(year).has(month)) {
        monthlySpend.get(year).set(month, 0);
      }
      // need to update the monthlyspend map
      let currentAmount = monthlySpend.get(year).get(month);

      monthlySpend.get(year).set(month, rounder.currencyRound(currentAmount + amount));
      Category.findByIdAndUpdate(
        categoryEntity._id,
        {"monthlySpend": monthlySpend}
      ).then(); // for some reason i need this .then(), otherwise the category doesn't update
    })
};

module.exports = CategoryController;
