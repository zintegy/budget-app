import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import AccountType from '../../utils/AccountType';

const AccountTypeSelector = ({ name, value, onChange }) => {
  const handleChange = (event, newValue) => {
    if (newValue === null) return;
    onChange({ target: { name, value: newValue } });
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      size="small"
    >
      {Object.values(AccountType).map(type => (
        <ToggleButton key={type} value={type}>
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default AccountTypeSelector;
