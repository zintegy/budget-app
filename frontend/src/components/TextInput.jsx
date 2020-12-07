import React from 'react';
import { Input } from '@material-ui/core';

const TextInput = ({
  onChange, 
  value, 
  error,
  name,
  label
}) => {
  return <div className="inputDiv">
    <label>{label}</label>
      <Input
      type="text"
      onChange={onChange}
      value={value}
      name={name}
      fullWidth={true}
    />
    <div className="inputError">
      {error}
    </div>
  </div>
}
export default TextInput;
