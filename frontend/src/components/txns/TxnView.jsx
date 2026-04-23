import React, {Component} from 'react';
import {
  Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, IconButton, Box, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

const expenseHeaders = ["Date", "Amount", "Merchant", "Description", "Category", "Account"]
const incomeHeaders = ["Date", "Amount", "Description", "Income Category", "Expense Category", "Account"]
const transferHeaders = ["Date", "Amount", "Description", "Source Account", "Destination Account"]

class ShowTxn extends Component {

  state = {
    showDeleteDialog: false,
  }

  render() {
    let {txn, accountToName, deleteTxn, refetchData, viewTxnType} = this.props;
    let {showDeleteDialog} = this.state;
    let isExpense = txn.txnType === "Expense";
    let isIncome = txn.txnType === "Income";
    let isTransfer = txn.txnType === "Transfer";
    let date = txn.txnDate.substring(0, txn.txnDate.length - 1)

    return <TableRow key={txn._id} hover>
      <TableCell>{new Date(date).toDateString()}</TableCell>
      <TableCell>${txn.amount}</TableCell>
      {isExpense ? <TableCell>{txn.merchant}</TableCell> : null}
      <TableCell>{txn.description}</TableCell>
      {isIncome ? <TableCell>{txn.incomeCategory}</TableCell> : null}
      {!isTransfer ? <TableCell>{txn.expenseCategory}</TableCell> : null}
      {!isIncome ? <TableCell>{accountToName(txn.sourceAccount)}</TableCell> : null}
      {!isExpense ? <TableCell>{accountToName(txn.destinationAccount)}</TableCell> : null}
      <TableCell padding="none" style={{ width: 48 }}>
        <IconButton size="small" onClick={() => this.setState({ showDeleteDialog: true })}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
      <Dialog
        open={showDeleteDialog}
        onClose={() => this.setState({ showDeleteDialog: false })}
      >
        <DialogTitle>Delete Transaction?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {new Date(date).toDateString()} &mdash; ${txn.amount}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {txn.description}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.setState({ showDeleteDialog: false })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              this.setState({ showDeleteDialog: false });
              deleteTxn(txn._id).then(() => refetchData(viewTxnType))
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </TableRow>;
  }
}

/*
 * Renders all transactions of type=viewTxnType.
 * Automatically loads more when the user scrolls near the bottom.
 */
class TxnView extends Component {

  componentDidMount() {
    this.attachScrollListener();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.scrollContainer !== this.props.scrollContainer) {
      this.detachScrollListener(prevProps.scrollContainer);
      this.attachScrollListener();
    }
  }

  componentWillUnmount() {
    this.detachScrollListener(this.props.scrollContainer);
  }

  attachScrollListener() {
    const el = this.getScrollElement();
    if (el) el.addEventListener('scroll', this.handleScroll);
  }

  detachScrollListener(container) {
    const el = container ? container.current : window;
    if (el) el.removeEventListener('scroll', this.handleScroll);
  }

  getScrollElement() {
    const { scrollContainer } = this.props;
    return scrollContainer && scrollContainer.current ? scrollContainer.current : window;
  }

  handleScroll = () => {
    const { hasMore, isLoadingMore, loadMoreTxns } = this.props;
    if (!hasMore || isLoadingMore) return;

    const el = this.getScrollElement();
    let scrolledNearBottom;
    if (el === window) {
      scrolledNearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
    } else {
      scrolledNearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 300;
    }

    if (scrolledNearBottom) {
      loadMoreTxns();
    }
  }

  render() {
    let { txns, deleteTxn, viewTxnType, accountToName, refetchData, isLoadingMore } = this.props;

    let txnRows = (txns && txns.length > 0)
      ? txns.filter(txn => txn.txnType === viewTxnType)
      .map(txn => <ShowTxn
        key={txn._id}
        txn={txn}
        deleteTxn={deleteTxn}
        accountToName={accountToName}
        refetchData={refetchData}
        viewTxnType={viewTxnType}
        />)
      : [];

    if (txnRows.length === 0) {
      return <Typography variant="body2" color="textSecondary" style={{ padding: 16 }}>No transactions</Typography>
    }

    let headerArray = [];
    if (viewTxnType === "Expense") headerArray = expenseHeaders;
    else if (viewTxnType === "Income") headerArray = incomeHeaders;
    else if (viewTxnType === "Transfer") headerArray = transferHeaders;

    return <div>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {headerArray.map(header => <TableCell key={header}>{header}</TableCell>)}
              <TableCell padding="none" style={{ width: 48 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {txnRows}
          </TableBody>
        </Table>
      </TableContainer>
      {isLoadingMore && (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={24} />
        </Box>
      )}
    </div>
  }
}

export default TxnView
