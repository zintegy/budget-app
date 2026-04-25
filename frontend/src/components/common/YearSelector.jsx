import React from 'react';
import {Select, MenuItem} from '@material-ui/core';

const START_YEAR = 2021;

const YearSelector = ({name, id, value, onChange, style}) => {
  const currentYear = new Date().getFullYear();
  const endYear = Math.max(currentYear + 1, value);
  const years = [];
  for (let y = START_YEAR; y <= endYear; y++) {
    years.push(y);
  }

  return <Select
      onChange={onChange}
      name={name}
      id={id}
      value={value}
      style={style}
    >
      {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
    </Select>
}

export default YearSelector;
