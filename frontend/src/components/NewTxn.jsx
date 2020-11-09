import React, {Component} from 'react';
import axios from 'axios';
import TextInput from './TextInput';
import SelectInput from './SelectInput';

const EXPENSE = 'Expense';
const INCOME = 'Income';
const TRANSFER = 'Transfer';

class NewTxn extends Component {

  state = {
    txnType: EXPENSE,
    amount : "",
    errors: {},
    merchant: "", 
    txnDate: ""
  }

  addTxn = () => {
    const txn = this.state;
    this.setState({
      errors: {}
    });
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
    let target = e.target;
    console.log(target);
    this.setState({
      [target.name] : target.value
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
    return (
      <div id="newTxnForm"> 
        <SelectInput
          onChange={this.inputOnChange}
          selected={txnType}
          options={[EXPENSE, INCOME, TRANSFER]}
          name="txnType"
          label="Txn Type"
          error={errors["txnType"]}
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
        {txnType == EXPENSE && <TextInput
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
        {txnType != TRANSFER && <TextInput
          onChange={this.inputOnChange}
          value={category}
          name="category"
          label="Category"
          error={errors["category"]}
          />}
        {txnType == INCOME && <TextInput
          onChange={this.inputOnChange}
          value={expenseCategory}
          name="expenseCategory"
          label="Expense Category"
          error={errors["expenseCategory"]}
          />}
        {txnType == TRANSFER && <TextInput
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
          label={(txnType == TRANSFER ? "Destination " : "") + "Account"}
          error={errors["account"]}
          />
        <button 
          className="newTxnSubmit" 
          onClick={this.addTxn}>Add Txn</button>
      </div>
    );
  }
}
export default NewTxn;
