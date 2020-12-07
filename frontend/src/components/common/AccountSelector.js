import React from 'react';
import {InputLabel, Select} from '@material-ui/core';

/** 
 * Shows a dropdown of accounts and allows you to select one*
 */

const AccountSelector = ({name, id, selected, label, error, accounts, onChange}) => {
  const options = accounts.map(account => (<option value={account._id}>{account.accountName} (${account.currentAmount})</option>))

  return (<div className="inputDiv">
    <label>{label}</label>
    <Select 
      native
      className="accountSelectorDropdown"
      value={selected}
      onChange={onChange}
      autowidth={true}
      inputProps={{
        name: name,
        id: {id}
      }}
    >
      <option aria-label="None" value="" />
      {options}
    </Select>
    <div className="inputError">
      {error}
    </div>
  </div>
  );
}



export default AccountSelector;


