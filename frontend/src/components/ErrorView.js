import React, {Component} from 'react';
import axios from 'axios';

class ErrorView extends Component {
  render() {
    let { errors } = this.props;
    const errorComponents = 
      Object.values(errors).map(error => {
        return <div>{error.message}</div>
      });
      console.log(errorComponents);
    return <div>{errorComponents}</div>
  }
}

export default ErrorView;
