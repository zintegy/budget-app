import React, {Component} from 'react';
import axios from 'axios';

const expenseHeaders = ["Date", "Amount", "Merchant", "Description", "Category", "Account"]
const incomeHeaders = ["Date", "Amount", "Description", "Income Category", "Expense Category", "Account"]
const transferHeaders = ["Date", "Amount", "Description", "Source Account", "Destination Account"]

/* 
 * Renders a single transaction, with the ability to delete by clicking on it. 
 */
const _showTxn = (txn, deleteTxn, accountToName) => {
  let isExpense = txn.txnType == "Expense";
  let isIncome = txn.txnType == "Income";
  let isTransfer = txn.txnType == "Transfer";
  return <tr onClick={() => deleteTxn(txn._id)}>
      <td>{txn.txnDate}</td>
      <td>{txn.amount}</td>
      {isExpense ? <td>{txn.merchant}</td> : ""}
      <td>{txn.description}</td>
      {!isTransfer ? <td>{txn.category}</td> : ""}
      {isIncome ? <td>{txn.expenseCategory}</td> : ""}
      {!isIncome ? <td>{accountToName(txn.sourceAccount)}</td> : ""}
      {!isExpense ? <td>{accountToName(txn.account)}</td> : ""}
    </tr>;
}

/*
 * Renders all transactions of type=viewTxnType.
 */
const TxnView = ({ txns, deleteTxn, viewTxnType, accountToName }) => {
  console.log(txns && txns.length > 0)
  console.log("Showing " + txns.length + " txns, type: " + viewTxnType)

  let txnRows = (txns && txns.length > 0) 
    ? txns.filter(txn => txn.txnType == viewTxnType)
          .map(txn => _showTxn(txn, deleteTxn, accountToName))
    : [];

  if (txnRows.length == 0) {
    return <table className="txnTable"> <tbody> <tr><td> No txns </td> </tr> </tbody> </table>
  }
  
  let headerArray = [];
  if (viewTxnType == "Expense") headerArray = expenseHeaders;
  else if (viewTxnType == "Income") headerArray = incomeHeaders;
  else if (viewTxnType == "Transfer") headerArray = transferHeaders;

  let header = <tr>{headerArray.map(header => <td>{header}</td>)}</tr>

  return <table className="txnTable"> <tbody> {header}{
    txnRows.length > 0  
      ? txnRows
      : <tr><td>No txns</td></tr>
  } </tbody></table>
}

export default TxnView
