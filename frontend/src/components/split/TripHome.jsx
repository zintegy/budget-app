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
  const [currency, setCurrency] = useState('USD');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState([]);

  // Active trip member/currency management
  const [newMemberInput, setNewMemberInput] = useState('');
  const [currencyInput, setCurrencyInput] = useState('');
  const [memberSubmitting, setMemberSubmitting] = useState(false);

  const fetchActiveTrip = useCallback(() => {
    setLoading(true);
    http.get('/tripApi/trip')
      .then(res => {
        const active = res.data.length > 0 ? res.data[0] : null;
        setTrip(active);
        if (active) setCurrencyInput(active.currency || 'USD');
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
    http.post('/tripApi/trip', { name: tripName.trim(), currency: currency.toUpperCase() || 'USD', members })
      .then(res => {
        if (res.data.errors) {
          const msgs = Object.values(res.data.errors).join(', ');
          setError(msgs);
        } else {
          setTrip(res.data);
          setTripName('');
          setCurrency('USD');
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

  const handleAddActiveMember = () => {
    const name = newMemberInput.trim();
    if (!name || !trip || trip.members.includes(name)) return;
    const updated = [...trip.members, name];
    setMemberSubmitting(true);
    setError('');
    http.put(`/tripApi/trip/${trip._id}/members`, { members: updated })
      .then(res => {
        setTrip(res.data);
        setNewMemberInput('');
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to add member.'))
      .finally(() => setMemberSubmitting(false));
  };

  const handleRemoveActiveMember = (name) => {
    if (!trip) return;
    const updated = trip.members.filter(m => m !== name);
    if (updated.length < 2) {
      setError('A trip must have at least 2 members.');
      return;
    }
    setMemberSubmitting(true);
    setError('');
    http.put(`/tripApi/trip/${trip._id}/members`, { members: updated })
      .then(res => setTrip(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to remove member.'))
      .finally(() => setMemberSubmitting(false));
  };

  const handleSaveCurrency = () => {
    if (!trip) return;
    const val = currencyInput.toUpperCase().trim();
    if (!val || val === (trip.currency || 'USD')) return;
    setMemberSubmitting(true);
    setError('');
    http.put(`/tripApi/trip/${trip._id}/members`, { members: trip.members, currency: val })
      .then(res => {
        setTrip(res.data);
        setCurrencyInput(res.data.currency || 'USD');
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to update currency.'))
      .finally(() => setMemberSubmitting(false));
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

      <Container maxWidth={false} style={{ marginTop: 32, paddingLeft: 32, paddingRight: 32 }}>
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
                  <Chip
                    key={m}
                    label={m}
                    onDelete={() => handleRemoveActiveMember(m)}
                    disabled={memberSubmitting}
                  />
                ))}
              </Box>
              <Box style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <TextField
                  label="Add Member"
                  variant="outlined"
                  size="small"
                  value={newMemberInput}
                  onChange={e => setNewMemberInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddActiveMember(); } }}
                  disabled={memberSubmitting}
                  style={{ flex: 1, maxWidth: 240 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddActiveMember}
                  disabled={memberSubmitting || !newMemberInput.trim()}
                >
                  Add
                </Button>
              </Box>
              <Box style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
                <TextField
                  label="Local Currency"
                  variant="outlined"
                  size="small"
                  value={currencyInput}
                  onChange={e => setCurrencyInput(e.target.value.toUpperCase())}
                  inputProps={{ maxLength: 3 }}
                  disabled={memberSubmitting}
                  style={{ width: 120 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleSaveCurrency}
                  disabled={memberSubmitting || !currencyInput.trim() || currencyInput.toUpperCase() === (trip.currency || 'USD')}
                >
                  Save
                </Button>
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
            <ExpenseGrid members={trip.members} tripId={trip._id} currency={trip.currency || 'USD'} />
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
            <TextField
              label="Currency"
              variant="outlined"
              value={currency}
              onChange={e => setCurrency(e.target.value.toUpperCase())}
              inputProps={{ maxLength: 3 }}
              helperText="3-letter code (e.g. USD, EUR, CAD)"
              style={{ marginBottom: 16, width: 200 }}
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
