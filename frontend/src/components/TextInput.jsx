import React from 'react';

const TextInput = ({
  onChange, 
  value, 
  error,
  name,
  label
}) => {
  console.log("Error: " + error);

  return <div className="inputDiv">
    <label>{label}</label>
      <input 
      type="text"
      onChange={onChange}
      value={value}
      name={name}
    />
    <div className="inputError">
      {error}
    </div>
  </div>
}
export default TextInput;
