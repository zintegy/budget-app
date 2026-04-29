import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Box, Container, Paper,
  TextField, Button, Chip
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import HomeIcon from '@material-ui/icons/Home';
import http from '../http-common';
import ExpenseGrid from './ExpenseGrid';

const TripHome = () => {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New trip form state
  const [tripName, setTripName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState([]);

  const fetchActiveTrip = useCallback(() => {
    setLoading(true);
    http.get('/tripApi/trip')
      .then(res => {
        setTrip(res.data.length > 0 ? res.data[0] : null);
        setError('');
      })
      .catch(() => setError('Failed to load trip data.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchActiveTrip();
  }, [fetchActiveTrip]);

  const handleAddMember = () => {
    const name = memberInput.trim();
    if (name && !members.includes(name)) {
      setMembers(prev => [...prev, name]);
      setMemberInput('');
    }
  };

  const handleRemoveMember = (name) => {
    setMembers(prev => prev.filter(m => m !== name));
  };

  const handleCreateTrip = () => {
    setSubmitting(true);
    setError('');
    http.post('/tripApi/trip', { name: tripName.trim(), members })
      .then(res => {
        if (res.data.errors) {
          const msgs = Object.values(res.data.errors).join(', ');
          setError(msgs);
        } else {
          setTrip(res.data);
          setTripName('');
          setMembers([]);
        }
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to create trip.'))
      .finally(() => setSubmitting(false));
  };

  const handleRetireTrip = () => {
    if (!window.confirm(`Retire trip "${trip.name}"? This cannot be undone.`)) return;
    setSubmitting(true);
    setError('');
    http.put(`/tripApi/trip/${trip._id}/retire`)
      .then(() => {
        setTrip(null);
      })
      .catch(() => setError('Failed to retire trip.'))
      .finally(() => setSubmitting(false));
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" component={Link} to="/">
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" style={{ fontWeight: 600 }}>
            Trip Splitter
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" style={{ marginTop: 32 }}>
        {error && (
          <Alert severity="error" style={{ marginBottom: 16 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Typography>Loading...</Typography>
        ) : trip ? (
          <>
            <Paper style={{ padding: 24 }}>
              <Typography variant="h5" style={{ fontWeight: 600 }}>
                {trip.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginTop: 4 }}>
                Created {new Date(trip.createdAt).toLocaleDateString()}
              </Typography>
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                {trip.members.map(m => (
                  <Chip key={m} label={m} />
                ))}
              </Box>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleRetireTrip}
                disabled={submitting}
                style={{ marginTop: 24 }}
              >
                {submitting ? 'Retiring...' : 'Retire Trip'}
              </Button>
            </Paper>
            <ExpenseGrid members={trip.members} />
          </>
        ) : (
          <Paper style={{ padding: 24 }}>
            <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 16 }}>
              New Trip
            </Typography>
            <TextField
              fullWidth
              label="Trip Name"
              variant="outlined"
              value={tripName}
              onChange={e => setTripName(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Box style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <TextField
                label="Member Name"
                variant="outlined"
                size="small"
                value={memberInput}
                onChange={e => setMemberInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddMember(); } }}
                style={{ flex: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleAddMember}
                disabled={!memberInput.trim()}
              >
                Add
              </Button>
            </Box>
            {members.length > 0 && (
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {members.map(m => (
                  <Chip key={m} label={m} onDelete={() => handleRemoveMember(m)} />
                ))}
              </Box>
            )}
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleCreateTrip}
              disabled={submitting || !tripName.trim() || members.length < 2}
            >
              {submitting ? 'Creating...' : 'Create Trip'}
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default TripHome;
