import React, {Component} from 'react';
import axios from 'axios';

import Input from './Input';
import TxnView from './TxnView';
import NewTxn from './NewTxn';
import SelectInput from './SelectInput';
import SelectTxnView from './SelectTxnView';
import Analysis from './Analysis';
import NewAccount from './NewAccount';

import {Container} from '@material-ui/core';

class AllTxns extends Component {
  state = {
    txns: [],
    viewTxnType: "Expense",
    accounts: [],
    accountToName: {}
  }

  componentDidMount() {
    this.getTxns();
    this.getAccounts();


  }

  getAccounts = () => {
  console.log("Getting accounts");
    axios.get('/accountApi/account')
      .then(res => {
        if (res.data) {
          let accountToName = {}
          res.data.map(account => {
            accountToName[account._id] = account.accountName});
          this.setState({accounts: res.data, accountToName})
        }
      })
      .catch(err => console.log(err))

    
  }

  getTxns = () => {
    axios.get('/txnApi/txn')
      .then(res => {
        if (res.data) {
          this.setState({txns : res.data})
        }
      })
      .catch(err => console.log(err)) 
  }

  deleteTxn = (id) => {
    console.log("Deleting " + id);
    axios.delete(`/txnApi/txn/${id}`)
      .then(res => {
        this.getTxns();
        this.getAccounts();
      })
      .catch(err => console.log(err))
  }

  viewTxnOnChange = (option) => {
    this.setState({
      viewTxnType: option
    });
  }

  accountToName = (accountId) => {
    if (accountId == null) return "";
    return this.state.accountToName[accountId];

  }

  render() {
    let { txns, viewTxnType, accounts } = this.state;
    console.log(this.state);

    return <div id="txnViewDiv">
      <Analysis/>
      <Container className="newEntityForms" maxWidth="lg">
        <NewTxn
          getTxns={this.getTxns}
          getAccounts={this.getAccounts}
          accounts={accounts}
        />
        <NewAccount
          getTxns={this.getTxns}
        />
      </Container>
      <SelectTxnView
        options={["Expense", "Income", "Transfer"]}
        onChange={this.viewTxnOnChange}
      />
      <TxnView
        txns={txns}
        deleteTxn={this.deleteTxn}
        viewTxnType={viewTxnType}
        accountToName={this.accountToName}
      />
    </div>
  }
}

export default AllTxns


