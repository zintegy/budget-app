import React from 'react';
import {TextField} from '@material-ui/core';
import {Autocomplete} from '@material-ui/lab';

/** 
 * Shows a dropdown of accounts and allows you to select one
 */

const AccountSelector = ({
  name, 
  id, 
  value, 
  inputValue,
  label, 
  error, 
  accounts, 
  onChange,
  onInputChange
}) => {
  return (<div className="inputDiv">
    <label>{label}</label>
    <Autocomplete
      autoHighlight
      debug
      value={value}
      inputValue={inputValue}
      className="selectorDropdown"
      onInputChange={onInputChange}
      name={name}
      onChange={(e, account) => {
        onChange(account, name)
      }}
      getOptionSelected={(opt, val) => {return val===opt._id}}
      options={accounts}
      getOptionLabel={(account) => account.accountName + " ($" + account.currentAmount + ")"}
      renderInput={(params) => <TextField {...params} name={name + "Input"}/>}
    />
    <div className="inputError">
      {error}
    </div>
  </div>
  );
}

const selectorOnChange = (that) => (newAccount, name) => {
  if (newAccount === null) {
    that.setState({
      [name]: null
    })
  }
  else {
    that.setState({
      [name]: newAccount._id,
      [name + "Input"]: newAccount.accountName + " ($" + newAccount.currentAmount + ")"
    })
  }
}

const updateSelectorInput = (that, accountId, name, allAccounts) => {
  if (accountId === null) return;
  let accountObj = allAccounts.filter(account => account._id === accountId)[0];
  const accountInput = accountObj.accountName + " ($" + accountObj.currentAmount + ")";

  that.setState({[name + "Input"]: accountInput});
}
  

export default AccountSelector;
export { selectorOnChange, updateSelectorInput };


