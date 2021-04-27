
import React from 'react';
import {Button} from '@material-ui/core';


function massDelete(accounts, deleteAccount) {
  console.log(deleteAccount);
  accounts.forEach(account => {console.log(account.accountName);deleteAccount(account._id)})
}

const RenderAccounts = ({accounts, deleteAccount}) => {

  let deleteButton = <Button onClick={() => massDelete(accounts,deleteAccount)}> Delete All Accounts</Button>
  deleteButton = ""; // overrides deletebutton


  const header=<tr>
    <td>Name</td>
    <td>Current amount</td>
    <td>Last txn date</td>
  </tr>

  const rows = accounts.map(account => <tr>
      <td>{account.accountName}</td>
      <td>{account.currentAmount}</td>
      <td>{account.lastTxnDate}</td>
    </tr>);

  return <table>
    {deleteButton}
    <tbody>
      {header}
      {rows}
    </tbody>
  </table>
}

export default RenderAccounts;
