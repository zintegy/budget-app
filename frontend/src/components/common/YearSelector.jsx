import React from 'react';
import {Select, MenuItem} from '@material-ui/core';

/*
 * Selector for year.
 * ID can be used to modify the CSS.
 */
const YearSelector = ({name, id, value, onChange}) => {
  return <Select
      onChange={onChange}
      name={name}
      id={id}
      value={value}
    >
      <MenuItem value={2021}>2021</MenuItem>
      <MenuItem value={2022}>2022</MenuItem>
      <MenuItem value={2023}>2023</MenuItem>
    </Select>
}



export default YearSelector;


