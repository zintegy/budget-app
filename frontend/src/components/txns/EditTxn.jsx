import React, {Component} from 'react';
import http from "../http-common";
import TextInput from '../common/TextInput';
import {Button, Grid, Box, Chip} from '@material-ui/core';
import {Alert} from '@material-ui/lab';
import TxnType from '../../utils/TxnType';
import CategorySelector, {categoryOnChange} from '../common/CategorySelector';
import AccountSelector, { selectorOnChange } from '../common/AccountSelector';
import DateInput from '../common/DateInput';

class EditTxn extends Component {

  constructor(props) {
    super(props);
    const { txn, accounts } = props;

    // Parse date from txn (strip trailing Z for UTC midnight)
    const dateStr = txn.txnDate.substring(0, txn.txnDate.length - 1);
    const txnDate = new Date(dateStr);

    // Build account input display strings
    const findAccountLabel = (accountId) => {
      if (!accountId) return "";
      const acct = accounts.find(a => a._id === accountId);
      return acct ? acct.accountName + " ($" + acct.currentAmount + ")" : "";
    };

    this.state = {
      amount: txn.amount.toString(),
      errors: {},
      description: txn.description || "",
      merchant: txn.merchant || "",
      txnDate: txnDate,
      sourceAccount: txn.sourceAccount || null,
      sourceAccountInput: findAccountLabel(txn.sourceAccount),
      destinationAccount: txn.destinationAccount || null,
      destinationAccountInput: findAccountLabel(txn.destinationAccount),
      incomeCategory: txn.incomeCategory || null,
      expenseCategory: txn.expenseCategory || null,
      isSubmitting: false,
      successMessage: "",
      errorMessage: ""
    };
  }

  saveTxn = () => {
    const { txn, onSuccess, refetchData } = this.props;
    const state = this.state;

    this.setState({
      errors: {},
      successMessage: "",
      errorMessage: "",
      isSubmitting: true
    });

    const UTCDate = Date.UTC(
      state.txnDate.getFullYear(),
      state.txnDate.getMonth(),
      state.txnDate.getDate());

    const body = {
      amount: state.amount,
      txnDate: UTCDate,
      description: state.description,
    };

    const txnType = txn.txnType;
    if (txnType === TxnType.EXPENSE) {
      body.merchant = state.merchant;
      body.sourceAccount = state.sourceAccount;
      body.expenseCategory = state.expenseCategory;
    }
    if (txnType === TxnType.INCOME) {
      body.destinationAccount = state.destinationAccount;
      body.expenseCategory = state.expenseCategory;
      body.incomeCategory = state.incomeCategory;
    }
    if (txnType === TxnType.TRANSFER) {
      body.sourceAccount = state.sourceAccount;
      body.destinationAccount = state.destinationAccount;
    }

    http.put(`/txnApi/txn/${txn._id}`, body)
      .then(res => {
        if (res.data && res.data.errors) {
          this.setState({ errors: res.data.errors });
          return;
        }
        if (res.data && res.data.error) {
          this.setState({ errorMessage: res.data.error });
          return;
        }
        this.setState({ successMessage: "Saved!" });
        refetchData(txnType);
        if (onSuccess) onSuccess();
      })
      .catch(() => this.setState({ errorMessage: "Request failed. Please try again." }))
      .finally(() => this.setState({ isSubmitting: false }));
  }

  inputOnChange = (e) => {
    if (e == null) return;
    let target = e.target;
    this.setState({
      [target.name]: target.value,
      successMessage: ""
    });
  }

  dateOnChange = (e) => {
    this.setState({ txnDate: e });
  }

  render() {
    const { txn, accounts, incomeCategories, expenseCategories } = this.props;
    const txnType = txn.txnType;
    const {
      amount, errors, merchant, txnDate, description,
      incomeCategory, destinationAccount, sourceAccount,
      sourceAccountInput, destinationAccountInput,
      expenseCategory, successMessage, errorMessage,
    } = this.state;

    return (
      <div>
        <Box mb={2}>
          <Chip label={txnType} color="primary" size="small" />
        </Box>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <DateInput
              selectedDate={txnDate}
              onChange={this.dateOnChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextInput
              onChange={this.inputOnChange}
              value={amount}
              name="amount"
              label="Amount"
              error={errors["amount"]}
            />
          </Grid>
        </Grid>
        {txnType === TxnType.EXPENSE && <TextInput
          onChange={this.inputOnChange}
          value={merchant}
          name="merchant"
          label="Merchant"
          error={errors["merchant"]}
        />}
        <TextInput
          onChange={this.inputOnChange}
          value={description}
          name="description"
          label="Description"
          error={errors["description"]}
        />
        {txnType === TxnType.INCOME && <CategorySelector
          onChange={categoryOnChange(this)}
          selected={incomeCategory}
          name="incomeCategory"
          label="Income Category"
          error={errors["incomeCategory"]}
          categories={incomeCategories}
        />}
        {txnType !== TxnType.TRANSFER && <CategorySelector
          onChange={categoryOnChange(this)}
          selected={expenseCategory}
          name="expenseCategory"
          label="Expense Category"
          error={errors["expenseCategory"]}
          categories={expenseCategories}
        />}
        {txnType !== TxnType.INCOME && <AccountSelector
          onChange={selectorOnChange(this)}
          onInputChange={this.inputOnChange}
          inputValue={sourceAccountInput}
          value={sourceAccount}
          name="sourceAccount"
          id="editSourceAccount"
          label="Source Account"
          error={errors["sourceAccount"]}
          accounts={accounts}
        />}
        {txnType !== TxnType.EXPENSE && <AccountSelector
          onChange={selectorOnChange(this)}
          onInputChange={this.inputOnChange}
          inputValue={destinationAccountInput}
          value={destinationAccount}
          name="destinationAccount"
          id="editDestAccount"
          label="Destination Account"
          error={errors["destinationAccount"]}
          accounts={accounts}
        />}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={this.saveTxn}
          disabled={this.state.isSubmitting}
          style={{ marginTop: 8 }}
        >
          {this.state.isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        {successMessage && <Alert severity="success" style={{ marginTop: 8 }}>{successMessage}</Alert>}
        {errorMessage && <Alert severity="error" style={{ marginTop: 8 }}>{errorMessage}</Alert>}
      </div>
    );
  }
}
export default EditTxn;
