import React, {Component} from 'react';
import http from "../http-common";
import TextInput from '../common/TextInput';
import {Button} from '@material-ui/core';
import {Alert} from '@material-ui/lab';
import ToggleSelector from '../common/ToggleSelector';

class NewCategory extends Component {

  state = {
    errors: {},
    categoryType: "Expense",
    isNecessity: "Yes",
    successMessage: "",
    isSubmitting: false,
    errorMessage: ""
  }

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

    return (
      <div>
        <ToggleSelector
          onChange={this.inputOnChange}
          value={categoryType}
          name="categoryType"
          options={["Expense", "Income"]}
          label="Category Type"
          error={errors["categoryType"]}
        />
        <TextInput
          onChange={this.inputOnChange}
          value={categoryName}
          name="categoryName"
          label="Category Name"
          error={errors["categoryName"]}
        />
        <ToggleSelector
          onChange={this.inputOnChange}
          value={isNecessity}
          options={["Yes", "No"]}
          error={errors["isNecessity"]}
          name="isNecessity"
          label="Is necessity?"
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={this.addCategory}
          disabled={this.state.isSubmitting}
          style={{ marginTop: 8 }}
        >
          {this.state.isSubmitting ? "Submitting..." : "Add Category"}
        </Button>
        {successMessage && <Alert severity="success" style={{ marginTop: 8 }}>{successMessage}</Alert>}
        {errorMessage && <Alert severity="error" style={{ marginTop: 8 }}>{errorMessage}</Alert>}
      </div>
    );
  }
}
export default NewCategory;
