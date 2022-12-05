import React, {Component} from 'react';
import http from "../http-common";
import TextInput from '../common/TextInput';
import {Button, Container} from '@material-ui/core';
import TxnType from '../../utils/TxnType';
import TxnTypeSelector from '../common/TxnTypeSelector';
import CategorySelector, {categoryOnChange} from '../common/CategorySelector';
import AccountSelector, { selectorOnChange, updateSelectorInput } from '../common/AccountSelector';
import DateInput from '../common/DateInput';

class EditTxn extends Component {

  state = {
    txnType: this.props.txnType || TxnType.EXPENSE,
    amount : this.props.amount || "",
    errors: {},
    description: this.props.description || "",
    merchant: this.props.merchant || "",
    txnDate: this.props.txnDate || "",
    sourceAccount: this.props.sourceAccount || null,
    sourceAccountInput: this.props.sourceAccount || "",
    destinationAccount: this.props.destinationAccount || null,
    destinationAccountInput: this.props.destinationAccount || "",
    successMessage: "",
    incomeCategory: this.props.incomeCategory || null,
    expenseCategory: this.props.expenseCategory || null
  }

  /*
   * Runs on initial load.
   */
  componentDidMount = () => {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    this.setState({
      "txnDate": today
    })
  }

  /*
   * Submits form contents to the backend.
   */
  addTxn = () => {
    let txn = Object.assign({}, this.state)
    // clear errors
    this.setState({
      errors: {}
    });

    // always use UTC midnight
    const UTCDate = Date.UTC(
      txn.txnDate.getFullYear(),
      txn.txnDate.getMonth(),
      txn.txnDate.getDate());

    txn.txnDate = UTCDate;

    http.post('/txnApi/txn', txn)
      .then(res => {
        if (res.data && res.data.errors) {
          console.log(res.data.errors);
          this.setState({
            errors: res.data.errors
          })

        }
        if (res.data && !res.data.errors) {
          this.setState({
            successMessage: "Success!"
          })
        }
        this.props.refetchData(txn.txnType).then(() => {
          updateSelectorInput(
            this, txn.sourceAccount, "sourceAccount", this.props.accounts);
          updateSelectorInput(
            this, txn.destinationAccount, "destinationAccount", this.props.accounts);
        });
      })
      .catch(err => console.log(err));

  }

  inputOnChange = (e) => {
    if (e == null) return;
    let target = e.target;
    this.setState({
      [target.name] : target.value,
      successMessage: ""
    });
  }

  dateOnChange = (e) => {
    this.setState({
      "txnDate" : e
    });
  }

  render() {
    let {
      amount,
      errors,
      txnType,
      merchant,
      txnDate,
      description,
      incomeCategory,
      destinationAccount,
      sourceAccount,
      sourceAccountInput,
      destinationAccountInput,
      expenseCategory,
      successMessage,
    } = this.state;
    return (<Container maxWidth="sm">
      <div id="newTxnForm">
        <TxnTypeSelector
          name="txnType"
          id="txnType"
          value={txnType}
          onChange={this.inputOnChange}
        />
        <DateInput
          selectedDate={txnDate}
          onChange={this.dateOnChange}
        />
        <TextInput
          onChange={this.inputOnChange}
          value={amount}
          name="amount"
          label="Amount"
          error={errors["amount"]}
          />
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
          categories={this.props.incomeCategories}
          />}
        {txnType !== TxnType.TRANSFER && <CategorySelector
          onChange={categoryOnChange(this)}
          selected={expenseCategory}
          name="expenseCategory"
          label="Expense Category"
          error={errors["expenseCategory"]}
          categories={this.props.expenseCategories}
          />}
        {txnType !== TxnType.INCOME && <AccountSelector
          onChange={selectorOnChange(this)}
          onInputChange={this.inputOnChange}
          inputValue={sourceAccountInput}
          value={sourceAccount}
          name="sourceAccount"
          id="selectSourceAccount"
          label="Source Account"
          error={errors["sourceAccount"]}
          accounts={this.props.accounts}
        />}
        {txnType !== TxnType.EXPENSE && <AccountSelector
          onChange={selectorOnChange(this)}
          onInputChange={this.inputOnChange}
          inputValue={destinationAccountInput}
          value={destinationAccount}
          name="destinationAccount"
          id="selectDestAccount"
          label="Destination Account"
          error={errors["destinationAccount"]}
          accounts={this.props.accounts}
        />}
        <div>
          <Button
            className="newTxnSubmit"
            onClick={this.addTxn}>Add Txn</Button>
          {successMessage}
        </div>
      </div></Container>
    );
  }
}
export default EditTxn;
