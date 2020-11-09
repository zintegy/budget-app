import React from 'react';

const SelectInput = ({
  onChange, 
  selected, 
  options, 
  error,
  name,
  label
}) => {

  const optionComponents = options.map(option => {
    return <option value={option}>{option}</option>;
  });

  return <label>{label}
    <select 
      value={selected} 
      onChange={onChange} 
      name={name}>
      {optionComponents}
    </select>
    <div className="inputError">
      {error}
    </div>
  </label>;
}
export default SelectInput;