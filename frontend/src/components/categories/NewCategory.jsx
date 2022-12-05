import React, {Component} from 'react';
import http from "../http-common";
import TextInput from '../common/TextInput';
import {Button, Container} from '@material-ui/core';
import RadioInput from '../common/RadioInput';

class NewCategory extends Component {

  state = {
    errors: {},
    isLiquid: "Yes",
    successMessage: ""
  }

  /*
   * Runs on initial load.
   */
  componentDidMount = () => {
  }

  /*
   * Submits form contents to the backend.
   */
  addCategory = () => {
    let category = Object.assign({}, this.state)

    // clear errors
    this.setState({
      errors: {}
    });

    category.isNecessity = category.isNecessity === "Yes";

    http.post('/categoryApi/category', category)
      .then(res => {
        if (res.data && res.data.errors) {
          this.setState({
            errors: res.data.errors
          })
        }
        if (res.data && !res.data.errors) {
          this.setState({
            successMessage: "Success!"
          });
        }
        this.props.getCategories();
      })
      .catch(err => console.log(err));

  }

  inputOnChange = (e) => {
    let target = e.target;
    this.setState({
      [target.name] : target.value,
      successMessage: ""
     });
  }

  render() {
    let {
      categoryType,
      categoryName,
      isNecessity,
      errors,
      successMessage
    } = this.state;

    return (<Container maxWidth="sm">
      <div id="newTxnForm">
        <RadioInput
          onChange={this.inputOnChange}
          value={categoryType}
          name="categoryType"
          options={["Expense", "Income"]}
          error={errors["categoryType"]}
          />
        <TextInput
          onChange={this.inputOnChange}
          value={categoryName}
          name="categoryName"
          label="Category Name"
          error={errors["categoryName"]}
          />
        <RadioInput
          onChange={this.inputOnChange}
          value={isNecessity}
          options={["Yes", "No"]}
          error={errors["isNecessity"]}
          name="isNecessity"
          label="Is necessity?"
          />
        <div>
          <Button
            className="newCategorySubmit"
            onClick={this.addCategory}
          >
            Add Category
          </Button>
          {successMessage}
        </div>
      </div></Container>
    );
  }
}
export default NewCategory;
