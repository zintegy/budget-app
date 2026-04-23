import React from 'react';
import { Typography, Box } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';

const ToggleSelector = ({ name, label, value, options, onChange, error }) => {
  const handleChange = (event, newValue) => {
    if (newValue === null) return;
    onChange({ target: { name, value: newValue } });
  };

  return (
    <Box mb={1.5}>
      {label && (
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {label}
        </Typography>
      )}
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        size="small"
      >
        {options.map(opt => (
          <ToggleButton key={opt} value={opt}>
            {opt}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {error && <Typography variant="caption" color="error">{error}</Typography>}
    </Box>
  );
};

export default ToggleSelector;
