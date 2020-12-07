
import React from 'react';
import Txn from './Txn';

const TxnView = ({ txns, deleteTxn, viewTxnType, accountToName }) => {
  console.log(txns && txns.length > 0)
  console.log("Txn type:" + viewTxnType);
  return <table className="txnTable"> <tbody> {
    (txns && txns.length > 0 
      ? (txns.map(txn => {
           if (txn.txnType == viewTxnType) {
             return <Txn
                 txn={txn}
                 deleteTxn={deleteTxn}
                 accountToName={accountToName}
               />
           }
           else {
             return;
           }

        }))
      : <tr><td>No txns</td></tr>
    )
  } </tbody> </table>
}

export default TxnView
