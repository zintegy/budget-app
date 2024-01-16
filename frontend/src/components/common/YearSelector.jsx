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
      <MenuItem value={2024}>2024</MenuItem>
      <MenuItem value={2025}>2025</MenuItem>
      <MenuItem value={2026}>2026</MenuItem>
      <MenuItem value={2027}>2027</MenuItem>
      <MenuItem value={2028}>2028</MenuItem>
      <MenuItem value={2029}>2029</MenuItem>
    </Select>
}



export default YearSelector;


