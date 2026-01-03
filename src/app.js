require('dotenv').config();
const express = require('express');
const leadsRouter = require('./routes/leads');
// Warn if vault master key is missing — vault operations require it
if (!process.env.VAULT_MASTER_KEY) {
	console.warn('Warning: VAULT_MASTER_KEY is not set. Server-side vault endpoints will be disabled or throw. Set VAULT_MASTER_KEY to enable encrypted server-side storage.');
}

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

// Serve admin UI
const path = require('path');
app.use('/admin/ui', express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
