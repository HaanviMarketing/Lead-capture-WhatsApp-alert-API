require('dotenv').config();
const express = require('express');
const leadsRouter = require('./routes/leads');

const app = express();

app.use(express.json());

app.use('/api/leads', leadsRouter);

const webhooks = require('./routes/webhooks');
app.use('/webhooks', express.json(), webhooks);

app.get('/', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
