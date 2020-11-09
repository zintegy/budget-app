import React from 'react';

const SelectTxnView = ({options, onChange}) => {
  return <div className="selectTxnViewButtons">
    {options.map(option => {
    return <button
      onClick={() => onChange(option)}>
        {option}
      </button>
    })
  } </div>

}

export default SelectTxnView;
