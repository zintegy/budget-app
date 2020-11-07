import React, {Component} from 'react';
import axios from 'axios';
import ErrorView from './ErrorView';
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
        console.log("Saved!");
        console.log(res.data);
        /*console.log(Object.values(res.data.errors).map(txn => console.log(txn)));*/
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
    } = this.state;
    return (
      <div> 
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
        <TextInput
          onChange={this.inputOnChange}
          value={category}
          name="category"
          label="Category"
          error={errors["category"]}
          />
        <TextInput
          onChange={this.inputOnChange}
          value={account}
          name="account"
          label="Account"
          error={errors["account"]}
          />
        <button onClick={this.addTxn}>Add Txn</button>
        <ErrorView 
          errors={errors}
          />

      </div>
    );
  }
}
export default NewTxn;
