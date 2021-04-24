import React, {Component} from 'react';
import axios from 'axios';

import TxnView from './txns/TxnView';
import NewTxn from './txns/NewTxn';
import AnalysisHome from './analysis/AnalysisHome';
import NewAccount from './accounts/NewAccount';
import NewCategory from './categories/NewCategory';
import TxnTypeSelector from './common/TxnTypeSelector';

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
    expenseCategories: []

  }

  /*
   * Runs on initial load. 
   */
  componentDidMount() {
    this.getTxns(this.state.viewTxnType);
    this.getAccounts();
    this.getCategories();
  }

  /*
   * Helper method to retrieve all accounts in the db. 
   * Also constructs a map of IDs to account names, so we know
   * which account ID has which name.
   */
  getAccounts = () => {
    return axios.get('/accountApi/account')
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
    axios.get('/txnApi/txn')
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
    axios.get('/categoryApi/category')
      .then(res => {
        if (res.data) {
          const expenseCategories = 
            res.data
              .filter(obj => obj.categoryType === "Expense")
              .map(obj => obj.categoryName);
          const incomeCategories = 
            res.data
              .filter(obj => obj.categoryType === "Income")
              .map(obj => obj.categoryName);

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
    axios.delete(`/txnApi/txn/${id}`)
      .then(res => {
        this.getTxns();
        this.getAccounts();
      })
      .catch(err => console.log(err))
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

  render() {
    let { 
      txns, 
      viewTxnType, 
      accounts, 
      expenseCategories, 
      incomeCategories 
    } = this.state;

    return <div id="txnViewDiv">
      <AnalysisHome/>
      <Container className="newEntityForms" maxWidth="lg">
        <Accordion>
          <AccordionSummary>
            New Txn 
          </AccordionSummary>
          <AccordionDetails> 
            <NewTxn
              getTxns={this.getTxns}
              getAccounts={this.getAccounts}
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
      />
      {/*TODO: move TxnTypeSelector into TxnView instead*/}
    </div>
  }
}

export default AppHome;

