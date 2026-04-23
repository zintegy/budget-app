import React, {Component} from 'react';
import http from "../http-common";
import TextInput from '../common/TextInput';
import {Button, Container} from '@material-ui/core';
import {Alert} from '@material-ui/lab';
import AccountType from '../../utils/AccountType';
import AccountTypeSelector from '../common/AccountTypeSelector';
import RadioInput from '../common/RadioInput';

class NewAccount extends Component {

  state = {
    accountType: AccountType.CC,
    errors: {},
    isLiquid: "Yes",
    successMessage: "",
    isSubmitting: false,
    errorMessage: ""
  }

  /*
   * Runs on initial load.
   */
  componentDidMount = () => {
  }

  /*
   * Submits form contents to the backend.
   */
  addAccount = () => {
    let account = Object.assign({}, this.state)

    this.setState({
      errors: {},
      successMessage: "",
      errorMessage: "",
      isSubmitting: true
    });

    account.isLiquid = account.isLiquid === "Yes";


    http.post('/accountApi/account', account)
      .then(res => {
        if (res.data && res.data.errors) {
          this.setState({
            errors: res.data.errors
          })
        }
        if (res.data && !res.data.errors) {
          this.setState({
            successMessage: "Success!"
          })
        }
        this.props.getAccounts();
      })
      .catch(() => this.setState({ errorMessage: "Request failed. Please try again." }))
      .finally(() => this.setState({ isSubmitting: false }));

  }

  inputOnChange = (e) => {
    let target = e.target;
    this.setState({
      [target.name] : target.value,
      successMessage: ""
    });
  }

  render() {
    let {
      accountType,
      accountName,
      startingAmount,
      isLiquid,
      errors,
      successMessage,
      errorMessage
    } = this.state;

    return (<Container maxWidth="sm">
      <div id="newTxnForm">
        <AccountTypeSelector
          onChange={this.inputOnChange}
          name="accountType"
          id="accountType"
          value={accountType}
        />
        <TextInput
          onChange={this.inputOnChange}
          value={accountName}
          name="accountName"
          label="Account Name"
          error={errors["accountName"]}
          />
        <TextInput
          onChange={this.inputOnChange}
          value={startingAmount}
          name="startingAmount"
          label="Starting Amount"
          error={errors["startingAmount"]}
          />
        <RadioInput
          onChange={this.inputOnChange}
          value={isLiquid}
          options={["Yes", "No"]}
          error={errors["isLiquid"]}
          name="isLiquid"
          label="Is liquid?"
          />
        <div>
          <Button
            className="newAccountSubmit"
            onClick={this.addAccount}
            disabled={this.state.isSubmitting}
          >
            {this.state.isSubmitting ? "Submitting..." : "Add Account"}
          </Button>
          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        </div>
      </div></Container>
    );
  }
}
export default NewAccount;
