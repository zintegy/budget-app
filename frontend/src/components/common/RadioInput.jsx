import React from 'react';

import {RadioGroup, FormControlLabel, Radio} from '@material-ui/core';

/*
 * Renders a set of radio buttons.
 */
const RadioInput = ({
  onChange, 
  value,
  options, 
  error,
  name,
  label,
  id
}) => {

  const selectors = options.map(val => <FormControlLabel
    value={val} control={<Radio/>} label={val} key={val}/>);

  let labelComponent = "";
  if (!!label) {
    labelComponent = <label>{label}</label>
  }

  return <div className="inputDiv">
    {labelComponent}
    <RadioGroup row name={name} id={id} onChange={onChange} value={value}>
      {selectors} 
    </RadioGroup>
    <div className="inputError">
      {error}
    </div>
  </div>;
}
export default RadioInput;
