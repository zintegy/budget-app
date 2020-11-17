import React from 'react';
import {RadioGroup, FormControlLabel, Radio} from '@material-ui/core';

import TxnType from '../../utils/TxnType';

const TxnTypeSelector = ({name, id, value, onChange}) => {
  return (
    <RadioGroup row name={name} id={id} onChange={onChange} value={value}>
      <FormControlLabel value={TxnType.EXPENSE} control={<Radio/>} label={TxnType.EXPENSE} />
      <FormControlLabel value={TxnType.INCOME} control={<Radio/>} label={TxnType.INCOME} />
      <FormControlLabel value={TxnType.TRANSFER} control={<Radio/>} label={TxnType.TRANSFER} />
    </RadioGroup>);
}



export default TxnTypeSelector;


