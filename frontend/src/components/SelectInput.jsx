import React from 'react';
import {Select} from '@material-ui/core';

const SelectInput = ({
  onChange, 
  selected, 
  options, 
  error,
  name,
  label
}) => {
  console.log("Options: " + options);

  const optionComponents = options.map(option => {
    return <option value={option}>{option}</option>;
  });

  return <div className="inputDiv">
    <label>{label}</label>
    <Select
      value={selected} 
      onChange={onChange} 
      name={name}>
      {optionComponents}
    </Select>
    <div className="inputError">
      {error}
    </div>
  </div>;
}
export default SelectInput;
