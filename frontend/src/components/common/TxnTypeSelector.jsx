import React from 'react';
import RadioInput from './RadioInput';

import TxnType from '../../utils/TxnType';

/*
 * Selector for txn type.
 * ID can be used to modify the CSS.
 *
 * TODO: make it look less like radio buttons?
 */
const TxnTypeSelector = ({name, id, value, onChange}) => {
  return <RadioInput
      onChange={onChange}
      name={name}
      id={id}
      value={value}
      options={Object.values(TxnType)}
    />
}



export default TxnTypeSelector;


