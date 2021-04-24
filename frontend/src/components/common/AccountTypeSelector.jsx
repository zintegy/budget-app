import React from 'react';
import RadioInput from './RadioInput';

import AccountType from '../../utils/AccountType';

/*
 * Selector for txn type.
 * ID can be used to modify the CSS.
 *
 * TODO: make it look less like radio buttons?
 */
const AccountTypeSelector = ({name, id, value, onChange}) => {
  return <RadioInput
    onChange={onChange}
    name={name}
    id={id}
    value={value}
    options={Object.values(AccountType)}
    />
}



export default AccountTypeSelector;


