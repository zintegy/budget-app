import React, {Component} from 'react';
import axios from 'axios';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import {Button, Container, Select, MenuItem} from '@material-ui/core';
import TxnType from '../utils/TxnType';
import TxnTypeSelector from './common/TxnTypeSelector';
import DateInput from './common/DateInput';

class NewAccount extends Component {

  state = {
    txnType: TxnType.EXPENSE,
    amount : "",
    errors: {},
    merchant: "", 
    txnDate: ""
  }

  componentDidMount = () => {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    this.setState({
      "txnDate": today
    })
  }

  addTxn = () => {
    let txn = Object.assign({}, this.state)
    this.setState({
      errors: {}
    });


    const UTCDate = Date.UTC(
      txn.txnDate.getFullYear(),
      txn.txnDate.getMonth(), 
      txn.txnDate.getDate());

    txn.amount = 1241243124;

    txn.txnDate = UTCDate;
    console.log(this.state);

    axios.post('/txnApi/txn', txn) 
      .then(res => {
        if (res.data && res.data.errors) {
          this.setState({
            errors: res.data.errors
          }, () => console.log(this.state))
        }
        this.props.getTxns();
      })
      .catch(err => console.log(err));
    
  }

  inputOnChange = (e) => {
    console.log("Changed: ");
    console.log(e)
    let target = e.target;
    console.log(target);
    this.setState({
      [target.name] : target.value
     }, () => console.log(this.state));
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
        {txnType == TxnType.TRANSFER && <TextInput
          onChange={this.inputOnChange}
          value={sourceAccount}
          name="sourceAccount"
          label="Source Account"
          error={errors["sourceAccount"]}
        />}
        <TextInput
          onChange={this.inputOnChange}
          value={account}
          name="account"
          label={(txnType == TxnType.TRANSFER ? "Destination " : "") + "Account"}
          error={errors["account"]}
          />
        <Button
          className="newTxnSubmit" 
          onClick={this.addTxn}>Add Txn</Button>
      </div></Container>
    );
  }
}
export default NewAccount;
