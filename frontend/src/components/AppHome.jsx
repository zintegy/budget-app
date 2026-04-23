import React, {Component} from 'react';

import http from "./http-common";
import TxnView from './txns/TxnView';
import NewTxn from './txns/NewTxn';
import AnalysisHome from './analysis/AnalysisHome';
import NewAccount from './accounts/NewAccount';
import NewCategory from './categories/NewCategory';
import TxnTypeSelector from './common/TxnTypeSelector';
import YearSelector from './common/YearSelector';

import RenderAccounts from './accounts/AccountView';

import {Button, Container, AccordionSummary, Accordion, AccordionDetails} from '@material-ui/core';
import {Alert} from '@material-ui/lab';

/*
 * The home page of the app. Should render all other components.
 */
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
  }

  /*
   * Runs on initial load.
   */
  componentDidMount() {
    this.refetchData(this.state.viewTxnType)
  }

  /*
   * Helper method to retrieve all accounts in the db.
   * Also constructs a map of IDs to account names, so we know
   * which account ID has which name.
   */
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

  /*
   * Retrieves all txns in the db.
   * May also modify which txn type is being shown, if an argument is passed.
   */
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

  /*
   * Deletes a txn by ID.
   * TODO: Must re-calculate account amount (maybe on backend)
   */
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
    if (!skipTxns) this.getTxns(txnType)
    this.getCategories()
    return this.getAccounts()
  }

  /*
   * On-change handler for changing txn type shown.
   */
  viewTxnOnChange = (e) => {
    let target = e.target;
    this.setState({
      viewTxnType: target.value
    });
  }

  /*
   * Helper method to retrieving the name of an account from the ID.
   */
  accountToName = (accountId) => {
    if (accountId === null) return "";
    return this.state.accountToName[accountId];
  }

  /**
   * helper method to change the current year.
   */
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
    } = this.state;

    const hasMismatches = reconcileResult &&
      (reconcileResult.accountDiffs.length > 0 || reconcileResult.categoryDiffs.length > 0);

    return <div id="txnViewDiv">
      {fetchError && <Alert severity="error" onClose={() => this.setState({ fetchError: "" })}>{fetchError}</Alert>}

      <Container className="analysisHome" maxWidth="false">
        <YearSelector
          name="yearSelector"
          id="yearSelector"
          onChange={this.yearOnChange}
          value={year}
        />
        <Accordion>
          <AccordionSummary>
            Analysis
          </AccordionSummary>
          <AccordionDetails>
            <AnalysisHome
              expenseCategories={expenseCategories}
              incomeCategories={incomeCategories}
              year={year}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            Accounts
          </AccordionSummary>
          <AccordionDetails>
            <RenderAccounts
              accounts={accounts}
              deleteAccount={this.deleteAccount}
            />
          </AccordionDetails>
        </Accordion>
        <div>
          <Button onClick={() => this.reconcile(false)} disabled={isReconciling}>
            {isReconciling ? "Checking..." : "Reconcile"}
          </Button>
          {reconcileResult && !reconcileResult.applied && !hasMismatches && (
            <Alert severity="success" onClose={() => this.setState({ reconcileResult: null })}>
              All balances are correct.
            </Alert>
          )}
          {reconcileResult && reconcileResult.applied && (
            <Alert severity="success" onClose={() => this.setState({ reconcileResult: null })}>
              Fixes applied successfully.
            </Alert>
          )}
          {hasMismatches && !reconcileResult.applied && <div>
            <Alert severity="warning">
              Mismatches found:
              {reconcileResult.accountDiffs.map(d => (
                <div key={d.id}>
                  <strong>Account "{d.name}"</strong>: stored ${d.storedAmount}, expected ${d.expectedAmount} (off by ${d.diff})
                  {Object.keys(d.monthDiffs).length > 0 && Object.entries(d.monthDiffs).map(([year, months]) =>
                    Object.entries(months).map(([month, v]) => (
                      <div key={`${d.id}-${year}-${month}`} style={{marginLeft: 16}}>
                        {year}/{parseInt(month)+1}: stored ${v.stored}, expected ${v.expected} (off by ${v.diff})
                      </div>
                    ))
                  )}
                </div>
              ))}
              {reconcileResult.categoryDiffs.map(d => (
                <div key={d.id}>
                  Category "{d.name}": {Object.entries(d.monthDiffs).map(([year, months]) =>
                    Object.entries(months).map(([month, v]) => (
                      <span key={`${year}-${month}`}>
                        {year}/{parseInt(month)+1}: stored ${v.stored}, expected ${v.expected} (off by ${v.diff}){' '}
                      </span>
                    ))
                  )}
                </div>
              ))}
            </Alert>
            <Button onClick={() => this.reconcile(true)} disabled={isReconciling}>
              Apply Fixes
            </Button>
          </div>}
        </div>
      </Container>
      <Container className="newEntityForms" maxWidth="lg">
        <Accordion>
          <AccordionSummary>
            New Txn
          </AccordionSummary>
          <AccordionDetails>
            <NewTxn
              refetchData={this.refetchData}
              insertTxn={this.insertTxn}
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
              accounts={accounts}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            New Account
          </AccordionSummary>
          <AccordionDetails>
            <NewAccount
              getAccounts={this.getAccounts}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            New Category
          </AccordionSummary>
          <AccordionDetails>
            <NewCategory
              getCategories={this.getCategories}
            />
          </AccordionDetails>
        </Accordion>
      </Container>
      <TxnTypeSelector
        name="selectTxnViewButtons"
        id="selectTxnViewButtons"
        onChange={this.viewTxnOnChange}
        value={viewTxnType}
      />
      <Button onClick={this.loadAllTxns} disabled={isLoadingMore}>
        {isLoadingMore ? "Loading..." : "Load All"}
      </Button>
      <TxnView
        txns={txns}
        deleteTxn={this.deleteTxn}
        viewTxnType={viewTxnType}
        accountToName={this.accountToName}
        refetchData={this.refetchData}
        loadMoreTxns={this.loadMoreTxns}
        hasMore={txns.length < totalTxnCount}
        isLoadingMore={isLoadingMore}
      />
      {/*TODO: move TxnTypeSelector into TxnView instead*/}
    </div>
  }
}

export default AppHome;

