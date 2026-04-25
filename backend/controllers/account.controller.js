const Account = require('../models/account');
const Category = require('../models/category');
const Txn = require('../models/txn');
const rounder = require('../helpers/rounder');
const DbErrorHandler = require('../helpers/DbErrorHandler');

const AccountController = {};

AccountController.get= (req, res, next) => {
  Account.find(req.query).sort([["lastTxnDate", -1], ["accountType"], ["accountName"]])
    .then(data => res.json(data))
    .catch(next);
};

AccountController.create = (req, res, next) => {
  req.body.currentAmount = req.body.startingAmount;

  Account.create(req.body)
    .then(data => res.json(data))
    .catch(data => {
      res.json(
        {"errors":
          DbErrorHandler.translateError(data["errors"])}
      );
    })
};

AccountController.delete = (req, res, next) => {
  Account.findOneAndDelete({"_id": req.params.id})
    .then(data => res.json(data))
    .catch(data => res.json({"error": "Not deleted."}))
};

AccountController.update = (req, res, next) => {
  console.log(req.params.id)
  console.log(req.body)
  Account.findByIdAndUpdate(req.params.id, req.body)
    .then(data => {res.json(data); console.log(data)})
    .catch(data => {res.json(data); console.log(data)})
};

AccountController.addAmountToAccount = (id, amount, date) => {
  const month = date.getUTCMonth().toString();
  const year = date.getUTCFullYear().toString();
  console.log("Adding amount to account")
  console.log(id)
  console.log(amount)
  console.log(date)

  return Account.find({"_id": id})
    .then(data => {
      const sourceAccountEntity = data[0];
      const monthlyDelta = sourceAccountEntity.monthlyDelta;

      // first transaction in the year
      if (!monthlyDelta.has(year)) {
        monthlyDelta.set(year, new Map());
        for (var allMonths = 0; allMonths < 12; allMonths++) {
          monthlyDelta.get(year).set(allMonths.toString(), 0);
        }
      }
      // should never happen, populate month if doesn't exist
      if (!monthlyDelta.get(year).has(month)) {
        monthlyDelta.get(year).set(month, 0);
      }

      let currentAmount = sourceAccountEntity.currentAmount;
      let monthlyAmount = monthlyDelta.get(year).get(month);
      monthlyDelta.get(year).set(month, rounder.currencyRound(monthlyAmount + amount));

      let lastTxnDate = sourceAccountEntity.lastTxnDate;
      if (lastTxnDate < date) lastTxnDate = date;

      return Account.findByIdAndUpdate(
        id,
        {
          "currentAmount": rounder.currencyRound(currentAmount + amount),
          "monthlyDelta": monthlyDelta,
          "lastTxnDate": lastTxnDate
        }
      );
    })
};

AccountController.reconcile = async (req, res, next) => {
  try {
    const apply = req.query.apply === 'true';
    const [txns, accounts, categories] = await Promise.all([
      Txn.find({}),
      Account.find({}),
      Category.find({})
    ]);

    // Build expected account values from transactions
    const accountExpected = {};
    accounts.forEach(acct => {
      accountExpected[acct._id.toString()] = {
        id: acct._id,
        name: acct.accountName,
        currentAmount: acct.startingAmount || 0,
        monthlyDelta: {},
        storedCurrentAmount: acct.currentAmount,
        storedMonthlyDelta: acct.monthlyDelta
      };
    });

    // Build expected category values from transactions
    const categoryExpected = {};
    categories.forEach(cat => {
      categoryExpected[cat.categoryName] = {
        id: cat._id,
        name: cat.categoryName,
        monthlySpend: {},
        storedMonthlySpend: cat.monthlySpend
      };
    });

    // Helper to add amount to a nested year/month map
    const addToMonthMap = (map, date, amount) => {
      const year = date.getUTCFullYear().toString();
      const month = date.getUTCMonth().toString();
      if (!map[year]) {
        map[year] = {};
        for (let m = 0; m < 12; m++) map[year][m.toString()] = 0;
      }
      map[year][month] = rounder.currencyRound((map[year][month] || 0) + amount);
    };

    // Replay all transactions
    txns.forEach(txn => {
      const date = new Date(txn.txnDate);
      const amount = txn.amount;

      // Account updates
      if (txn.txnType !== 'Income' && txn.sourceAccount && accountExpected[txn.sourceAccount]) {
        accountExpected[txn.sourceAccount].currentAmount = rounder.currencyRound(
          accountExpected[txn.sourceAccount].currentAmount - amount);
        addToMonthMap(accountExpected[txn.sourceAccount].monthlyDelta, date, -amount);
      }
      if (txn.txnType !== 'Expense' && txn.destinationAccount && accountExpected[txn.destinationAccount]) {
        accountExpected[txn.destinationAccount].currentAmount = rounder.currencyRound(
          accountExpected[txn.destinationAccount].currentAmount + amount);
        addToMonthMap(accountExpected[txn.destinationAccount].monthlyDelta, date, amount);
      }

      // Category updates
      if (txn.txnType === 'Expense' && txn.expenseCategory && categoryExpected[txn.expenseCategory]) {
        addToMonthMap(categoryExpected[txn.expenseCategory].monthlySpend, date, amount);
      }
      if (txn.txnType === 'Income') {
        const catName = txn.expenseCategory || txn.incomeCategory;
        if (catName && categoryExpected[catName]) {
          addToMonthMap(categoryExpected[catName].monthlySpend, date, -amount);
        }
      }
    });

    // Compare and build diffs
    const accountDiffs = [];
    for (const key of Object.keys(accountExpected)) {
      const exp = accountExpected[key];
      const stored = exp.storedMonthlyDelta;
      const currentMismatch = rounder.currencyRound(exp.storedCurrentAmount) !== rounder.currencyRound(exp.currentAmount);

      const monthDiffs = {};
      let hasMonthDiff = false;
      for (const year of Object.keys(exp.monthlyDelta)) {
        for (const month of Object.keys(exp.monthlyDelta[year])) {
          const expectedVal = exp.monthlyDelta[year][month];
          let storedVal = 0;
          if (stored && stored.has && stored.has(year) && stored.get(year).has(month)) {
            storedVal = stored.get(year).get(month);
          }
          if (rounder.currencyRound(storedVal) !== rounder.currencyRound(expectedVal)) {
            hasMonthDiff = true;
            if (!monthDiffs[year]) monthDiffs[year] = {};
            monthDiffs[year][month] = {
              stored: storedVal,
              expected: expectedVal,
              diff: rounder.currencyRound(storedVal - expectedVal)
            };
          }
        }
      }

      if (currentMismatch || hasMonthDiff) {
        accountDiffs.push({
          id: exp.id,
          name: exp.name,
          storedAmount: exp.storedCurrentAmount,
          expectedAmount: exp.currentAmount,
          diff: rounder.currencyRound(exp.storedCurrentAmount - exp.currentAmount),
          monthDiffs
        });
      }
    }

    const categoryDiffs = [];
    for (const key of Object.keys(categoryExpected)) {
      const exp = categoryExpected[key];
      const stored = exp.storedMonthlySpend;
      let hasDiff = false;
      const monthDiffs = {};

      for (const year of Object.keys(exp.monthlySpend)) {
        for (const month of Object.keys(exp.monthlySpend[year])) {
          const expectedVal = exp.monthlySpend[year][month];
          let storedVal = 0;
          if (stored && stored.has && stored.has(year) && stored.get(year).has(month)) {
            storedVal = stored.get(year).get(month);
          }
          if (rounder.currencyRound(storedVal) !== rounder.currencyRound(expectedVal)) {
            hasDiff = true;
            if (!monthDiffs[year]) monthDiffs[year] = {};
            monthDiffs[year][month] = {
              stored: storedVal,
              expected: expectedVal,
              diff: rounder.currencyRound(storedVal - expectedVal)
            };
          }
        }
      }

      if (hasDiff) {
        categoryDiffs.push({
          id: exp.id,
          name: exp.name,
          monthDiffs
        });
      }
    }

    // Apply fixes if requested
    if (apply) {
      const updates = [];
      for (const key of Object.keys(accountExpected)) {
        const exp = accountExpected[key];
        const monthlyDeltaMap = new Map();
        for (const year of Object.keys(exp.monthlyDelta)) {
          const monthMap = new Map();
          for (const month of Object.keys(exp.monthlyDelta[year])) {
            monthMap.set(month, exp.monthlyDelta[year][month]);
          }
          monthlyDeltaMap.set(year, monthMap);
        }
        updates.push(Account.findByIdAndUpdate(exp.id, {
          currentAmount: exp.currentAmount,
          monthlyDelta: monthlyDeltaMap
        }));
      }
      for (const key of Object.keys(categoryExpected)) {
        const exp = categoryExpected[key];
        const monthlySpendMap = new Map();
        for (const year of Object.keys(exp.monthlySpend)) {
          const monthMap = new Map();
          for (const month of Object.keys(exp.monthlySpend[year])) {
            monthMap.set(month, exp.monthlySpend[year][month]);
          }
          monthlySpendMap.set(year, monthMap);
        }
        updates.push(Category.findByIdAndUpdate(exp.id, {
          monthlySpend: monthlySpendMap
        }));
      }
      await Promise.all(updates);
    }

    res.json({
      accountDiffs,
      categoryDiffs,
      applied: apply
    });
  } catch (err) {
    next(err);
  }
};

module.exports = AccountController;
