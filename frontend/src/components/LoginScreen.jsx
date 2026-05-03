import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import axios from 'axios';

const LoginScreen = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL || '';
      const res = await axios.post(`${baseURL}/authApi/verify`, { password }, {
        headers: { 'ngrok-skip-browser-warning': '123' }
      });
      localStorage.setItem('token', res.data.token);
      onLogin();
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: 360, padding: 16 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom style={{ fontWeight: 700 }}>
            Budgeting
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" style={{ marginBottom: 24 }}>
            Enter the password to continue
          </Typography>
          {error && <Alert severity="error" style={{ marginBottom: 16 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="password"
              label="Password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !password}
              style={{ marginTop: 16 }}
            >
              {loading ? 'Verifying...' : 'Enter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginScreen;
