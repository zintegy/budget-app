import React, {Component} from 'react';
import axios from 'axios';

import Input from './Input';
import TxnView from './TxnView';
import NewTxn from './NewTxn';
import SelectInput from './SelectInput';
import SelectTxnView from './SelectTxnView';
import Analysis from './Analysis';

class AllTxns extends Component {
  state = {
    txns: [],
    viewTxnType: "Expense",
  }

  componentDidMount() {
    this.getTxns();
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
      .then(res => this.getTxns())
      .catch(err => console.log(err))
  }

  viewTxnOnChange = (option) => {
    this.setState({
      viewTxnType: option
    });
  }

  render() {
    let { txns, viewTxnType } = this.state;
    console.log(this.state);

    return <div id="txnViewDiv">
      <Analysis/>
      <NewTxn
        getTxns={this.getTxns}
      />
      <SelectTxnView
        options={["Expense", "Income", "Transfer"]}
        onChange={this.viewTxnOnChange}
      />
      <TxnView
        txns={txns}
        deleteTxn={this.deleteTxn}
        viewTxnType={viewTxnType}
      />
    </div>
  }
}

export default AllTxns


