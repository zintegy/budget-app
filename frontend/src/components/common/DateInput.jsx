import React from 'react';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

const DateInput = ({id, label, selectedDate, onChange}) => {
  if (selectedDate === null || selectedDate === "") {
    selectedDate = new Date();
  }

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
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
      />
    </MuiPickersUtilsProvider>
  );

}

export default DateInput;


