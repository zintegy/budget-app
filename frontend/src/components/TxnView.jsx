
import React from 'react';
import Txn from './Txn';

const TxnView = ({ txns, deleteTxn }) => {
  console.log(txns && txns.length > 0)
  return <table> <tbody> {
    (txns && txns.length > 0 
      ? (txns.map(txn => {
           return <Txn
               txn={txn}
               deleteTxn={deleteTxn}
             />
        }))
      : <tr><td>No txns</td></tr>
    )
  } </tbody> </table>
}

export default TxnView
