const express = require('express');
const authRoutes = require('./routes/auth');
const claimRoutes = require('./routes/claims');

const app = express();

// middleware
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/claims', claimRoutes);

// health check
app.get('/', (req, res) => {
  res.json({ status: 'Backend running' });
});

module.exports = app;
