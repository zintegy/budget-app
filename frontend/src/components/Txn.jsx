import React, {Component} from 'react';
import axios from 'axios';

const ShowTxn = ({txn, deleteTxn}) => {
  return <tr onClick={() => deleteTxn(txn._id)}> 
      <td>{txn.txnType}</td>
      <td>{txn.txnDate}</td>
      <td>{txn.amount}</td>
      <td>{txn.merchant}</td>
      <td>{txn.account}</td>
      <td>{txn.description}</td>
      <td>{txn.category}</td>
      <td>{txn.expenseCategory}</td>
      <td>{txn.sourceAccount}</td>
    </tr>;
}
export default ShowTxn;
