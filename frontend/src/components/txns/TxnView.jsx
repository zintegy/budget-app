import React, {Component} from 'react';
import {
  Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, IconButton, Box, CircularProgress,
  Dialog, DialogTitle, DialogContent
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import EditTxn from './EditTxn';
import TxnTypeSelector from '../common/TxnTypeSelector';

const expenseHeaders = ["Date", "Amount", "Merchant", "Description", "Category", "Account"]
const incomeHeaders = ["Date", "Amount", "Description", "Income Category", "Expense Category", "Account"]
const transferHeaders = ["Date", "Amount", "Description", "Source Account", "Destination Account"]

class ShowTxn extends Component {

  state = {
    showEditDialog: false,
  }

  render() {
    let {txn, accountToName, deleteTxn, refetchData, viewTxnType,
         accounts, incomeCategories, expenseCategories} = this.props;
    let {showEditDialog} = this.state;
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
      <TableCell padding="none" style={{ width: 40 }}>
        <IconButton size="small" onClick={() => this.setState({ showEditDialog: true })}>
          <EditIcon fontSize="small" />
        </IconButton>
      </TableCell>

      {/* Edit Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => this.setState({ showEditDialog: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          <EditTxn
            txn={txn}
            accounts={accounts}
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
            accountToName={accountToName}
            refetchData={refetchData}
            deleteTxn={deleteTxn}
            viewTxnType={viewTxnType}
            onSuccess={() => this.setState({ showEditDialog: false })}
          />
        </DialogContent>
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
    let { txns, deleteTxn, viewTxnType, accountToName, refetchData, isLoadingMore,
          accounts, incomeCategories, expenseCategories,
          onTxnTypeChange, loadAllTxns } = this.props;

    let txnRows = (txns && txns.length > 0)
      ? txns.filter(txn => txn.txnType === viewTxnType)
      .map(txn => <ShowTxn
        key={txn._id}
        txn={txn}
        deleteTxn={deleteTxn}
        accountToName={accountToName}
        refetchData={refetchData}
        viewTxnType={viewTxnType}
        accounts={accounts}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        />)
      : [];

    let headerArray = [];
    if (viewTxnType === "Expense") headerArray = expenseHeaders;
    else if (viewTxnType === "Income") headerArray = incomeHeaders;
    else if (viewTxnType === "Transfer") headerArray = transferHeaders;

    return <div>
      <Box display="flex" alignItems="center" mb={1}>
        <TxnTypeSelector
          name="selectTxnViewButtons"
          id="selectTxnViewButtons"
          onChange={onTxnTypeChange}
          value={viewTxnType}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={loadAllTxns}
          disabled={isLoadingMore}
          style={{ marginLeft: 16 }}
        >
          {isLoadingMore ? "Loading..." : "Load All"}
        </Button>
      </Box>
      {txnRows.length === 0
        ? <Typography variant="body2" color="textSecondary" style={{ padding: 16 }}>No transactions</Typography>
        : <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {headerArray.map(header => <TableCell key={header}>{header}</TableCell>)}
                  <TableCell padding="none" style={{ width: 40 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {txnRows}
              </TableBody>
            </Table>
          </TableContainer>
      }
      {isLoadingMore && (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={24} />
        </Box>
      )}
    </div>
  }
}

export default TxnView
