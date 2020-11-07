import React from 'react';

const TextInput = ({
  onChange, 
  value, 
  error,
  name,
  label
}) => {
  console.log("Error: " + error);

  return <label>{label}
    <input 
      type="text"
      onChange={onChange}
      value={value}
      name={name}
    />
    {error}
  </label>
}
export default TextInput;
