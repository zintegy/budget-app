import React from 'react';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import './styles/App.scss';

import minimal from './themes/minimal';
import AppHome from './components/AppHome';

const App = () => {
  return (
    <ThemeProvider theme={minimal}>
      <CssBaseline />
      <AppHome />
    </ThemeProvider>
  );
};

export default App;
