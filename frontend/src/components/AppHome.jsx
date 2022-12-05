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

import {Container, AccordionSummary, Accordion, AccordionDetails} from '@material-ui/core';

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
      .catch(err => console.log(err))
  }

  /*
   * Retrieves all txns in the db.
   * May also modify which txn type is being shown, if an argument is passed.
   */
  getTxns = (txnType) => {
    if (!txnType) {
      txnType = this.state.viewTxnType;
    }
    http.get('/txnApi/txn')
      .then(res => {
        if (res.data) {
          this.setState({
            txns : res.data,
            viewTxnType: txnType
          })
        }
      })
      .catch(err => console.log(err))
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
      .catch(err => console.log(err))
  }

  /*
   * Deletes a txn by ID.
   * TODO: Must re-calculate account amount (maybe on backend)
   */
  deleteTxn = (id) => {
    console.log("Deleting " + id);
    return http.delete(`/txnApi/txn/${id}`)
      .catch(err => console.log(err))
  }

  deleteAccount = (id) => {
    console.log("Deleting account " + id);
    return http.delete(`/accountApi/account/${id}`)
      .catch(err => console.log(err))
  }

  refetchData = (txnType) => {
    this.getTxns(txnType)
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
    });
  }

  render() {
    let {
      txns,
      viewTxnType,
      accounts,
      expenseCategories,
      incomeCategories,
      year,
    } = this.state;

    return <div id="txnViewDiv">

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
      </Container>
      <Container className="newEntityForms" maxWidth="lg">
        <Accordion>
          <AccordionSummary>
            New Txn
          </AccordionSummary>
          <AccordionDetails>
            <NewTxn
              refetchData={this.refetchData}
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
      <TxnView
        txns={txns}
        deleteTxn={this.deleteTxn}
        viewTxnType={viewTxnType}
        accountToName={this.accountToName}
        refetchData={this.refetchData}
        year={year}
      />
      {/*TODO: move TxnTypeSelector into TxnView instead*/}
    </div>
  }
}

export default AppHome;

