import React, {Component} from 'react';
import http from "../http-common";
import TextInput from '../common/TextInput';
import {Button, Container} from '@material-ui/core';
import {Alert} from '@material-ui/lab';
import RadioInput from '../common/RadioInput';

class NewCategory extends Component {

  state = {
    errors: {},
    isLiquid: "Yes",
    successMessage: "",
    isSubmitting: false,
    errorMessage: ""
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

    this.setState({
      errors: {},
      successMessage: "",
      errorMessage: "",
      isSubmitting: true
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
      .catch(() => this.setState({ errorMessage: "Request failed. Please try again." }))
      .finally(() => this.setState({ isSubmitting: false }));

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
      successMessage,
      errorMessage
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
            disabled={this.state.isSubmitting}
          >
            {this.state.isSubmitting ? "Submitting..." : "Add Category"}
          </Button>
          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        </div>
      </div></Container>
    );
  }
}
export default NewCategory;
