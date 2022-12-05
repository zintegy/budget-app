import React, {Component} from 'react';
import http from "../http-common";
import TextInput from '../common/TextInput';
import {Button, Container} from '@material-ui/core';
import AccountType from '../../utils/AccountType';
import AccountTypeSelector from '../common/AccountTypeSelector';
import RadioInput from '../common/RadioInput';

class NewAccount extends Component {

  state = {
    accountType: AccountType.CC,
    errors: {},
    isLiquid: "Yes",
    successMessage: "",
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

    // clear errors
    this.setState({
      errors: {}
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
      .catch(err => console.log(err));

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
      successMessage
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
          >
            Add Account
          </Button>
          {successMessage}
        </div>
      </div></Container>
    );
  }
}
export default NewAccount;
