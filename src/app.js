require('dotenv').config();
const express = require('express');
const leadsRouter = require('./routes/leads');

const app = express();

app.use(express.json());

app.use('/api/leads', leadsRouter);

const webhooks = require('./routes/webhooks');
// Use raw body for webhook route so we can verify signatures (X-Hub-Signature-256)
app.use('/webhooks', express.raw({ type: 'application/json' }), webhooks);

const preview = require('./routes/preview');
app.use('/api', express.json(), preview);

app.get('/', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
