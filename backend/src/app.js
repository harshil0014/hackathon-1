const express = require('express');

const app = express();

// middleware
app.use(express.json());

// health check
app.get('/', (req, res) => {
  res.json({ status: 'Backend running' });
});

module.exports = app;
