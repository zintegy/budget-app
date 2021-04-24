import React from 'react';
import {TextField} from '@material-ui/core';
import {Autocomplete} from '@material-ui/lab';

/** 
 * Shows a category of accounts and allows you to select one
 */

const CategorySelector = ({name, id, selected, label, error, categories, onChange}) => {
  const options = categories.map(category => <option 
    value={category}
    key={category}
  >{category}</option>)

  return (<div className="inputDiv">
    <label>{label}</label>
    <Autocomplete
      autoHighlight
      debug
      value={selected}
      className="selectorDropdown"
      name={name}
      onChange={(e, category) => onChange(category, name) }
      options={categories}
      renderInput={(params) => <TextField {...params}/>}
    />
    <div className="inputError">
      {error}
    </div>
  </div>
  );
}

const categoryOnChange = (that) => (newCategory, name) => {
  that.setState({
    [name]: newCategory
  })
}


export default CategorySelector;
export {categoryOnChange};


