import React, {Component} from 'react';
import axios from 'axios';
import TextInput from '../common/TextInput';
import {Button, Container, Select, MenuItem} from '@material-ui/core';
import TxnType from '../..//utils/TxnType';
import TxnTypeSelector from '../common/TxnTypeSelector';
import AccountSelector from '../common/AccountSelector';
import DateInput from '../common/DateInput';

class NewTxn extends Component {

  state = {
    txnType: TxnType.EXPENSE,
    amount : "",
    errors: {},
    merchant: "", 
    txnDate: "",
    account: "",
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
    console.log(this.state);

    axios.post('/txnApi/txn', txn) 
      .then(res => {
        if (res.data && res.data.errors) {
          this.setState({
            errors: res.data.errors
          }, () => console.log(this.state))
        }
        this.props.getTxns(txn.txnType);
        this.props.getAccounts();
      })
      .catch(err => console.log(err));
    
  }

  inputOnChange = (e) => {
    let target = e.target;
    this.setState({
      [target.name] : target.value
     }, () => {console.log("New state:"); console.log(this.state)});
  }

  dateOnChange = (e) => {
    console.log("Date changed")
    this.setState({
      "txnDate" : e 
    }, () => console.log(this.state));
  }

  render() {
    let { 
      amount, 
      errors, 
      txnType, 
      merchant,
      txnDate,
      description,
      category,
      account,
      sourceAccount,
      expenseCategory,
    } = this.state;
    console.log("Accounts: ");
    console.log(this.props.accounts);
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
          value={txnDate}
          name="txnDate"
          label="Date"
          error={errors["txnDate"]}
          />
        <TextInput
          onChange={this.inputOnChange}
          value={amount}
          name="amount"
          label="Amount"
          error={errors["amount"]}
          />
        {txnType == TxnType.EXPENSE && <TextInput
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
        {txnType != TxnType.TRANSFER && <TextInput
          onChange={this.inputOnChange}
          value={category}
          name="category"
          label={(txnType == TxnType.INCOME ? "Income " : "") + "Category"}
          error={errors["category"]}
          />}
        {txnType == TxnType.INCOME && <TextInput
          onChange={this.inputOnChange}
          value={expenseCategory}
          name="expenseCategory"
          label="Expense Category"
          error={errors["expenseCategory"]}
          />}
        {txnType != TxnType.INCOME && <AccountSelector
          onChange={this.inputOnChange}
          selected={sourceAccount}
          name="sourceAccount"
          id="selectSourceAccout"
          label="Source Account"
          error={errors["sourceAccount"]}
          accounts={this.props.accounts}
        />}
        {txnType != TxnType.EXPENSE && <AccountSelector
          onChange={this.inputOnChange}
          selected={account}
          name="account"
          id="selectDestAccount"
          label={"destination Account"}
          error={errors["account"]}
          accounts={this.props.accounts}
        />}
        <Button
          className="newTxnSubmit" 
          onClick={this.addTxn}>Add Txn</Button>
      </div></Container>
    );
  }
}
export default NewTxn;
