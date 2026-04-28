
import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography
} from '@material-ui/core';

const RenderAccounts = ({accounts}) => {

  if (!accounts || accounts.length === 0) {
    return <Typography variant="body2" color="textSecondary">No accounts</Typography>
  }
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };


  return <TableContainer>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Current Amount</TableCell>
          <TableCell>Last Txn Date</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {accounts.map(account => (
          <TableRow key={account._id} hover>
            <TableCell>{account.accountName}</TableCell>
            <TableCell>{account.currentAmount}</TableCell>
            <TableCell>{new Date(account.lastTxnDate).toLocaleDateString("en-US", options)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
}

export default RenderAccounts;
