import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import TxnType from '../../utils/TxnType';

const TxnTypeSelector = ({ name, value, onChange }) => {
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
      {Object.values(TxnType).map(type => (
        <ToggleButton key={type} value={type}>
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default TxnTypeSelector;
