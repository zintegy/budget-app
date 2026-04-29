import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Card, CardActionArea, CardContent, Typography, Container
} from '@material-ui/core';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';

const tools = [
  {
    title: 'Budgeting',
    description: 'Track transactions, manage accounts, and analyze spending',
    path: '/budgeting',
    icon: <AccountBalanceWalletIcon style={{ fontSize: 48, color: '#1976d2' }} />,
  },
];

const HomePage = () => (
  <Box style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: 700, marginBottom: 32 }}>
        Tools
      </Typography>
      <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
        {tools.map((tool) => (
          <Card key={tool.path} style={{ width: 260 }}>
            <CardActionArea component={Link} to={tool.path}>
              <CardContent style={{ textAlign: 'center', padding: 32 }}>
                {tool.icon}
                <Typography variant="h6" style={{ fontWeight: 600, marginTop: 12 }}>
                  {tool.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                  {tool.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Container>
  </Box>
);

export default HomePage;
