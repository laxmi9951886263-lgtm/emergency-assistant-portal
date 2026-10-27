const express = require('express');
const cors = require('cors');
const requestsRouter = require('./routes/requests.routes');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200' }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Emergency Assistance Portal API is running' });
});

app.use('/api/requests', requestsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`Emergency Assistance Portal API running at http://localhost:${PORT}`);
});
