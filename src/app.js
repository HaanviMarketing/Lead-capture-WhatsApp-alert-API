require('dotenv').config();
const express = require('express');
const leadsRouter = require('./routes/leads');

const app = express();

// Mount webhooks first with raw body parser so signature verification can use the raw payload
const webhooks = require('./routes/webhooks');
app.use('/webhooks', express.raw({ type: 'application/json' }), webhooks);

app.use(express.json());

app.use('/api/leads', leadsRouter);

const preview = require('./routes/preview');
app.use('/api', express.json(), preview);

// Admin routes (protected by ADMIN_API_KEY)
const adminAuth = require('./middleware/adminAuth');
const adminRoutes = require('./routes/admin');
app.use('/admin', express.json(), adminAuth, adminRoutes);

app.get('/', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
