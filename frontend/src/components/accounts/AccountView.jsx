
import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography
} from '@material-ui/core';

const RenderAccounts = ({accounts}) => {

  if (!accounts || accounts.length === 0) {
    return <Typography variant="body2" color="textSecondary">No accounts</Typography>
  }

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
            <TableCell>{account.lastTxnDate}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
}

export default RenderAccounts;
