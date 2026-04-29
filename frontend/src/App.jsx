import React, { useState, useCallback } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import './styles/App.scss';

import minimal from './themes/minimal';
import AppHome from './components/AppHome';
import HomePage from './components/HomePage';
import LoginScreen from './components/LoginScreen';
import TripHome from './components/split/TripHome';

const BudgetingRoute = () => {
  const [authenticated, setAuthenticated] = useState(() => !!localStorage.getItem('token'));

  const handleLogin = useCallback(() => {
    setAuthenticated(true);
  }, []);

  if (!authenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <AppHome />;
};

const App = () => {
  return (
    <ThemeProvider theme={minimal}>
      <CssBaseline />
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/budgeting" component={BudgetingRoute} />
          <Route path="/split" component={TripHome} />
          <Redirect to="/" />
        </Switch>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
