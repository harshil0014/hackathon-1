const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const claimRoutes = require('./routes/claims');
const userRoutes = require('./routes/users');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();

// CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// JSON parsing middleware
app.use(express.json());

// 🔓 serve uploaded proof files
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'))
);

// routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/claims', claimRoutes);
app.use('/leaderboard', leaderboardRoutes);

// health check
app.get('/', (req, res) => {
  res.json({ status: 'Backend running' });
});

module.exports = app;