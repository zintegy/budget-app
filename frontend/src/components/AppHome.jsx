import React, {Component, createRef} from 'react';

import http from "./http-common";
import TxnView from './txns/TxnView';
import NewTxn from './txns/NewTxn';
import AnalysisHome from './analysis/AnalysisHome';
import NewAccount from './accounts/NewAccount';
import NewCategory from './categories/NewCategory';
import TxnTypeSelector from './common/TxnTypeSelector';
import YearSelector from './common/YearSelector';
import RenderAccounts from './accounts/AccountView';

import {
  Button, Typography, Box, Paper, AppBar, Toolbar,
  Dialog, DialogTitle, DialogContent, Tab, Divider
} from '@material-ui/core';
import {Alert, TabContext, TabList, TabPanel} from '@material-ui/lab';
import AddIcon from '@material-ui/icons/Add';

class AppHome extends Component {
  state = {
    txns: [],
    viewTxnType: "Expense",
    accounts: [],
    accountToName: {},
    incomeCategories: [],
    expenseCategories: [],
    year: new Date().getFullYear(),
    fetchError: "",
    totalTxnCount: 0,
    isLoadingMore: false,
    reconcileResult: null,
    isReconciling: false,
    rightTab: "transactions",
    showNewAccountDialog: false,
    showNewCategoryDialog: false,
  }

  rightPanelRef = createRef();

  componentDidMount() {
    this.refetchData(this.state.viewTxnType)
  }

  getAccounts = () => {
    return http.get('/accountApi/account')
      .then(res => {
        if (res.data) {
          let accountToName = {}
          res.data.forEach(account => {
            accountToName[account._id] = account.accountName});
          this.setState({accounts: res.data, accountToName})
        }
      })
      .catch(() => this.setState({ fetchError: "Failed to load accounts." }))
  }

  getTxns = (txnType) => {
    if (!txnType) {
      txnType = this.state.viewTxnType;
    }
    http.get(`/txnApi/txn?year=${this.state.year}&limit=50`)
      .then(res => {
        if (res.data) {
          this.setState({
            txns: res.data.txns,
            totalTxnCount: res.data.totalCount,
            viewTxnType: txnType
          })
        }
      })
      .catch(() => this.setState({ fetchError: "Failed to load transactions." }))
  }

  loadMoreTxns = () => {
    const { txns, year, isLoadingMore } = this.state;
    if (isLoadingMore || txns.length === 0) return;

    const lastTxn = txns[txns.length - 1];
    this.setState({ isLoadingMore: true });

    http.get(`/txnApi/txn?year=${year}&cursorDate=${lastTxn.txnDate}&cursorId=${lastTxn._id}&limit=50`)
      .then(res => {
        if (res.data) {
          this.setState(prev => ({
            txns: [...prev.txns, ...res.data.txns],
          }))
        }
      })
      .catch(() => this.setState({ fetchError: "Failed to load more transactions." }))
      .finally(() => this.setState({ isLoadingMore: false }));
  }

  loadAllTxns = () => {
    const { year, isLoadingMore } = this.state;
    if (isLoadingMore) return;

    this.setState({ isLoadingMore: true });

    http.get(`/txnApi/txn?year=${year}&limit=999999`)
      .then(res => {
        if (res.data) {
          this.setState({
            txns: res.data.txns,
            totalTxnCount: res.data.totalCount,
          })
        }
      })
      .catch(() => this.setState({ fetchError: "Failed to load all transactions." }))
      .finally(() => this.setState({ isLoadingMore: false }));
  }

  getCategories = () => {
    http.get('/categoryApi/category')
      .then(res => {
        if (res.data) {
          const expenseCategories =
            res.data
              .filter(obj => obj.categoryType === "Expense")
          const incomeCategories =
            res.data
              .filter(obj => obj.categoryType === "Income")

          this.setState({
            expenseCategories,
            incomeCategories
          })
        }
      })
      .catch(() => this.setState({ fetchError: "Failed to load categories." }))
  }

  deleteTxn = (id) => {
    console.log("Deleting " + id);
    return http.delete(`/txnApi/txn/${id}`)
      .catch(() => this.setState({ fetchError: "Failed to delete transaction." }))
  }

  deleteAccount = (id) => {
    console.log("Deleting account " + id);
    return http.delete(`/accountApi/account/${id}`)
      .catch(() => this.setState({ fetchError: "Failed to delete account." }))
  }

  insertTxn = (newTxn) => {
    this.setState(prev => {
      const txns = [...prev.txns];
      const insertIdx = txns.findIndex(t => {
        const tDate = new Date(t.txnDate).getTime();
        const newDate = new Date(newTxn.txnDate).getTime();
        if (tDate < newDate) return true;
        if (tDate === newDate && t._id < newTxn._id) return true;
        return false;
      });
      if (insertIdx === -1) {
        txns.push(newTxn);
      } else {
        txns.splice(insertIdx, 0, newTxn);
      }
      return { txns, totalTxnCount: prev.totalTxnCount + 1 };
    });
  }

  reconcile = (apply = false) => {
    this.setState({ isReconciling: true });
    const url = apply ? '/accountApi/account/reconcile?apply=true' : '/accountApi/account/reconcile';
    http.post(url)
      .then(res => {
        if (res.data) {
          this.setState({ reconcileResult: res.data });
          if (apply) {
            this.getAccounts();
            this.getCategories();
          }
        }
      })
      .catch(() => this.setState({ fetchError: "Reconciliation failed." }))
      .finally(() => this.setState({ isReconciling: false }));
  }

  refetchData = (txnType, { skipTxns } = {}) => {
    if (txnType) this.setState({ viewTxnType: txnType })
    if (!skipTxns) this.getTxns(txnType)
    this.getCategories()
    return this.getAccounts()
  }

  viewTxnOnChange = (e) => {
    let target = e.target;
    this.setState({
      viewTxnType: target.value
    });
  }

  accountToName = (accountId) => {
    if (accountId === null) return "";
    return this.state.accountToName[accountId];
  }

  yearOnChange = (e) => {
    let target = e.target;
    this.setState({
      year: target.value
    }, () => this.refetchData(this.state.viewTxnType));
  }

  render() {
    let {
      txns,
      viewTxnType,
      accounts,
      expenseCategories,
      incomeCategories,
      year,
      fetchError,
      totalTxnCount,
      isLoadingMore,
      reconcileResult,
      isReconciling,
      rightTab,
      showNewAccountDialog,
      showNewCategoryDialog,
    } = this.state;

    const hasMismatches = reconcileResult &&
      (reconcileResult.accountDiffs.length > 0 || reconcileResult.categoryDiffs.length > 0);

    return (
      <div className="app-root">
        {/* AppBar */}
        <AppBar position="static" color="primary" elevation={1}>
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Budget Tracker
            </Typography>
            <Box display="flex" alignItems="center" style={{ color: '#fff' }}>
              <Typography variant="body2" style={{ marginRight: 8 }}>Year:</Typography>
              <YearSelector
                name="yearSelector"
                id="yearSelector"
                onChange={this.yearOnChange}
                value={year}
                style={{ color: '#fff' }}
              />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Error banner */}
        {fetchError && (
          <Alert severity="error" onClose={() => this.setState({ fetchError: "" })} style={{ borderRadius: 0 }}>
            {fetchError}
          </Alert>
        )}

        {/* Two-panel layout */}
        <div className="layout-container">
          {/* LEFT PANEL */}
          <div className="left-panel">
            {/* Add Transaction */}
            <Paper elevation={1} style={{ padding: 16, marginBottom: 16 }}>
              <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
                Add Transaction
              </Typography>
              <NewTxn
                refetchData={this.refetchData}
                insertTxn={this.insertTxn}
                incomeCategories={incomeCategories}
                expenseCategories={expenseCategories}
                accounts={accounts}
              />
            </Paper>

            {/* Accounts */}
            <Paper elevation={1} style={{ padding: 16, marginBottom: 16 }}>
              <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
                Accounts
              </Typography>
              <RenderAccounts
                accounts={accounts}
                deleteAccount={this.deleteAccount}
              />
            </Paper>

            {/* Action Buttons */}
            <Box display="flex" gap={1} mb={2} style={{ gap: 8 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => this.setState({ showNewAccountDialog: true })}
              >
                Account
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => this.setState({ showNewCategoryDialog: true })}
              >
                Category
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => this.reconcile(false)}
                disabled={isReconciling}
              >
                {isReconciling ? "Checking..." : "Reconcile"}
              </Button>
            </Box>

            {/* Reconcile Results */}
            {reconcileResult && !reconcileResult.applied && !hasMismatches && (
              <Alert severity="success" onClose={() => this.setState({ reconcileResult: null })} style={{ marginBottom: 16 }}>
                All balances are correct.
              </Alert>
            )}
            {reconcileResult && reconcileResult.applied && (
              <Alert severity="success" onClose={() => this.setState({ reconcileResult: null })} style={{ marginBottom: 16 }}>
                Fixes applied successfully.
              </Alert>
            )}
            {hasMismatches && !reconcileResult.applied && <div style={{ marginBottom: 16 }}>
              <Alert severity="warning">
                Mismatches found:
                {reconcileResult.accountDiffs.map(d => (
                  <div key={d.id}>
                    <strong>Account "{d.name}"</strong>: stored ${d.storedAmount}, expected ${d.expectedAmount} (off by ${d.diff})
                    {Object.keys(d.monthDiffs).length > 0 && Object.entries(d.monthDiffs).map(([yr, months]) =>
                      Object.entries(months).map(([month, v]) => (
                        <div key={`${d.id}-${yr}-${month}`} style={{marginLeft: 16}}>
                          {yr}/{parseInt(month)+1}: stored ${v.stored}, expected ${v.expected} (off by ${v.diff})
                        </div>
                      ))
                    )}
                  </div>
                ))}
                {reconcileResult.categoryDiffs.map(d => (
                  <div key={d.id}>
                    Category "{d.name}": {Object.entries(d.monthDiffs).map(([yr, months]) =>
                      Object.entries(months).map(([month, v]) => (
                        <span key={`${yr}-${month}`}>
                          {yr}/{parseInt(month)+1}: stored ${v.stored}, expected ${v.expected} (off by ${v.diff}){' '}
                        </span>
                      ))
                    )}
                  </div>
                ))}
              </Alert>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => this.reconcile(true)}
                disabled={isReconciling}
                style={{ marginTop: 8 }}
              >
                Apply Fixes
              </Button>
            </div>}
          </div>

          {/* RIGHT PANEL */}
          <div className="right-panel" ref={this.rightPanelRef}>
            <Paper elevation={1} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <TabContext value={rightTab}>
                <TabList
                  onChange={(e, v) => this.setState({ rightTab: v })}
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab label="Transactions" value="transactions" />
                  <Tab label="Analysis" value="analysis" />
                </TabList>
                <Divider />
                <TabPanel value="transactions" style={{ padding: 16, flex: 1, overflow: 'auto' }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TxnTypeSelector
                      name="selectTxnViewButtons"
                      id="selectTxnViewButtons"
                      onChange={this.viewTxnOnChange}
                      value={viewTxnType}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={this.loadAllTxns}
                      disabled={isLoadingMore}
                      style={{ marginLeft: 16 }}
                    >
                      {isLoadingMore ? "Loading..." : "Load All"}
                    </Button>
                  </Box>
                  <TxnView
                    txns={txns}
                    deleteTxn={this.deleteTxn}
                    viewTxnType={viewTxnType}
                    accountToName={this.accountToName}
                    refetchData={this.refetchData}
                    loadMoreTxns={this.loadMoreTxns}
                    hasMore={txns.length < totalTxnCount}
                    isLoadingMore={isLoadingMore}
                    scrollContainer={this.rightPanelRef}
                    accounts={accounts}
                    incomeCategories={incomeCategories}
                    expenseCategories={expenseCategories}
                  />
                </TabPanel>
                <TabPanel value="analysis" style={{ padding: 16, flex: 1, overflow: 'auto' }}>
                  <AnalysisHome
                    expenseCategories={expenseCategories}
                    incomeCategories={incomeCategories}
                    year={year}
                  />
                </TabPanel>
              </TabContext>
            </Paper>
          </div>
        </div>

        {/* New Account Dialog */}
        <Dialog
          open={showNewAccountDialog}
          onClose={() => this.setState({ showNewAccountDialog: false })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>New Account</DialogTitle>
          <DialogContent>
            <NewAccount getAccounts={this.getAccounts} />
          </DialogContent>
        </Dialog>

        {/* New Category Dialog */}
        <Dialog
          open={showNewCategoryDialog}
          onClose={() => this.setState({ showNewCategoryDialog: false })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>New Category</DialogTitle>
          <DialogContent>
            <NewCategory getCategories={this.getCategories} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

export default AppHome;
