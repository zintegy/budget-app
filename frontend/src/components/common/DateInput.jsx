import React from 'react';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

const DateInput = ({id, label, selectedDate, onChange}) => {
  if (selectedDate === null || selectedDate === "") {
    selectedDate = new Date();
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const current = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
      if (isNaN(current.getTime())) return;
      const next = new Date(current);
      next.setDate(next.getDate() + (e.key === 'ArrowUp' ? 1 : -1));
      onChange(next);
    }
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
            disableToolbar
            variant="inline"
            format="yyyy-MM-dd"
            margin="normal"
            id={id}
            label={label}
            value={selectedDate}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
      />
    </MuiPickersUtilsProvider>
  );

}

export default DateInput;


