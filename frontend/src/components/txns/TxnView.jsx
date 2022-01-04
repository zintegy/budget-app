import React, {Component} from 'react';
import {Modal} from 'react-overlays';
import {Button, Backdrop} from '@material-ui/core';

const expenseHeaders = ["Date", "Amount", "Merchant", "Description", "Category", "Account"]
const incomeHeaders = ["Date", "Amount", "Description", "Income Category", "Expense Category", "Account"]
const transferHeaders = ["Date", "Amount", "Description", "Source Account", "Destination Account"]

/*
 * Renders a single transaction, with the ability to delete by clicking on it.
 */

class ShowTxn extends Component {

  // prop types: txn, accountToName, deleteTxn
  //
  toggleShowPopover = (show) => {
    this.setState({showDeletePopover: show})
    console.log("Set to " + show)
  }

  state = {
    showDeletePopover: false,
  }

  renderBackdrop = () => {
    let {showDeletePopover} = this.state;
    return <Backdrop open={showDeletePopover} onClick={() => this.toggleShowPopover(false)} id="deletePopoverBackdrop"/>
  }

  render() {
    let {txn, accountToName, deleteTxn, refetchData, viewTxnType} = this.props;
    let {showDeletePopover} = this.state;
    let isExpense = txn.txnType === "Expense";
    let isIncome = txn.txnType === "Income";
    let isTransfer = txn.txnType === "Transfer";
    let date = txn.txnDate.substring(0, txn.txnDate.length - 1)

    return <tr key={txn._id}>
      <td>{new Date(date).toDateString()}</td>
      <td>${txn.amount}</td>
      {isExpense ? <td>{txn.merchant}</td> : null}
      <td>{txn.description}</td>
      {isIncome ? <td>{txn.incomeCategory}</td> : null}
      {!isTransfer ? <td>{txn.expenseCategory}</td> : null}
      {!isIncome ? <td>{accountToName(txn.sourceAccount)}</td> : null}
      {!isExpense ? <td>{accountToName(txn.destinationAccount)}</td> : null}
      <div onClick={() => this.toggleShowPopover(true)}>X</div>
      <Modal
        show={showDeletePopover}
        onHide={() => this.toggleShowPopover(false)}
        renderBackdrop={this.renderBackdrop}
        id="deleteTxnPopover"
        onkeypress={() => console.log("Key pressed")}
      >
        <div>Delete this txn?
          <div>
            <Button onClick={() => this.toggleShowPopover(false)}>No</Button>
            <Button onClick={() => {
              this.toggleShowPopover(false);
              deleteTxn(txn._id).then(() => refetchData(viewTxnType))
            }}
            >Yes</Button>
          </div>
          {new Date(date).toDateString()}<br/>
          ${txn.amount}<br/>
          {txn.description}
        </div>
      </Modal>
    </tr>;
  }
}

/*
 * Renders all transactions of type=viewTxnType.
 */
const TxnView = ({ txns, deleteTxn, viewTxnType, accountToName, refetchData, year }) => {

  let txnRows = (txns && txns.length > 0)
    ? txns.filter(txn => txn.txnType === viewTxnType && new Date(txn.txnDate.substring(0, txn.txnDate.length - 1)).getFullYear() === year)
    .map(txn => <ShowTxn
      txn={txn}
      deleteTxn={deleteTxn}
      accountToName={accountToName}
      refetchData={refetchData}
      viewTxnType={viewTxnType}
      />)
    : [];

  if (txnRows.length === 0) {
    return <table className="txnTable"><tbody><tr><td>No txns</td></tr></tbody></table> }
  let headerArray = [];
  if (viewTxnType === "Expense") headerArray = expenseHeaders;
  else if (viewTxnType === "Income") headerArray = incomeHeaders;
  else if (viewTxnType === "Transfer") headerArray = transferHeaders;

  let header = <tr>{headerArray.map(header => <td key={header}>{header}</td>)}</tr>

    // leave commented unless you need it
    let deleteButton = <Button onClick={() => massDelete(txns, deleteTxn)}> Delete All </Button>
    deleteButton = "";

    return <div>
      {deleteButton}
      <table className="txnTable"><tbody>{header}{
        txnRows.length > 0
          ? txnRows
          : <tr key="notxn"><td>No txns</td></tr>
      }</tbody></table>
    </div>
}

function massDelete(txns, deleteTxn) {
  txns.forEach(txn => console.log(deleteTxn(txn._id)))
}

export default TxnView
