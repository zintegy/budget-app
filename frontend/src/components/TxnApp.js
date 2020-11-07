import React, {Component} from 'react';
import axios from 'axios';

import Input from './Input';
import TxnView from './TxnView';
import NewTxn from './NewTxn';

class AllTxns extends Component {
  state = {
    txns: []
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

  render() {
    let { txns } = this.state;
    console.log(txns);

    return <div>
      <NewTxn
        getTxns={this.getTxns}
      />
      <TxnView
        txns={txns}
        deleteTxn={this.deleteTxn}
      />
    </div>
  }
}

export default AllTxns


