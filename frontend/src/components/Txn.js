import React, {Component} from 'react';
import axios from 'axios';

class Txn extends Component {
  render() {
    let txn = this.props.txn;
    return <tr onClick={() => this.props.deleteTxn(txn._id)}> 
        <td>{txn.txnType}</td>
        <td>{txn.amount}</td>
        <td>{txn.merchant}</td>
        <td>{txn.txnDate}</td>
      </tr>;
  }
}
export default Txn;
