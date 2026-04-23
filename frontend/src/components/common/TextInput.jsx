import React from 'react';
import { TextField } from '@material-ui/core';

const TextInput = ({ onChange, value, error, name, label }) => {
  return (
    <TextField
      variant="outlined"
      size="small"
      fullWidth
      label={label}
      name={name}
      value={value || ''}
      onChange={onChange}
      error={!!error}
      helperText={error || ''}
      style={{ marginBottom: 12 }}
    />
  );
};

export default TextInput;
