const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello from the CI/CD pipeline', version: process.env.APP_VERSION || 'dev' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = app;
