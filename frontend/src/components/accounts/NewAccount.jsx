import React, {Component} from 'react';
import http from "../http-common";
import TextInput from '../common/TextInput';
import {Button, Box} from '@material-ui/core';
import {Alert} from '@material-ui/lab';
import AccountTypeSelector from '../common/AccountTypeSelector';
import ToggleSelector from '../common/ToggleSelector';
import AccountType from '../../utils/AccountType';

class NewAccount extends Component {

  state = {
    accountType: AccountType.CC,
    errors: {},
    isLiquid: "Yes",
    successMessage: "",
    isSubmitting: false,
    errorMessage: ""
  }

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

    return (
      <div>
        <Box mb={1.5}>
          <AccountTypeSelector
            onChange={this.inputOnChange}
            name="accountType"
            value={accountType}
          />
        </Box>
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
        <ToggleSelector
          onChange={this.inputOnChange}
          value={isLiquid}
          options={["Yes", "No"]}
          error={errors["isLiquid"]}
          name="isLiquid"
          label="Is liquid?"
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={this.addAccount}
          disabled={this.state.isSubmitting}
          style={{ marginTop: 8 }}
        >
          {this.state.isSubmitting ? "Submitting..." : "Add Account"}
        </Button>
        {successMessage && <Alert severity="success" style={{ marginTop: 8 }}>{successMessage}</Alert>}
        {errorMessage && <Alert severity="error" style={{ marginTop: 8 }}>{errorMessage}</Alert>}
      </div>
    );
  }
}
export default NewAccount;
