import React, {Component} from 'react';
import axios from 'axios';

import Input from './Input';
import TodoList from './TodoList';

class AllTodos extends Component {
  state = {
    todos: []
  }

  componentDidMount() {
    this.getTodos();
  }

  getTodos = () => {
    axios.get('/api/todos')
      .then(res => {
        if (res.data) {
          this.setState({todos: res.data})
        }
      })
      .catch(err => console.log(err)) 
  }

  deleteTodo = (id) => {
    axios.delete(`/api/todos/${id}`)
      .then(res => this.getTodos())
      .catch(err => console.log(err))
  }
  



  render() {
    let { todos } = this.state;

    return <div>
      <Input getTodos={this.getTodos}/>
      <TodoList 
        todos={todos}
        deleteTodo={this.deleteTodo}
      />
      
    </div>;
  }
}

export default AllTodos


