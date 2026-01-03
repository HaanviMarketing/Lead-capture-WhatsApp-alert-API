const express = require('express');
const router = express.Router();
const db = require('../db');
const adminAuth = require('../middleware/adminAuth');
const vault = require('../vault');

router.use(adminAuth);

router.get('/leads', (req, res) => {
  try {
    const leads = db.getAllLeads();
    const deliveryStatuses = db.getDeliveryStatuses();
    const webhookEvents = db.getWebhookEvents();
    return res.json({ leads, deliveryStatuses, webhookEvents });
  } catch (e) {
    console.error('Failed to fetch admin data', e && e.message);
    return res.status(500).json({ error: 'Failed to fetch admin data' });
  }
});

// Store an encrypted secret (e.g. API key) server-side. Requires VAULT_MASTER_KEY env var.
router.post('/vault', (req, res) => {
  try {
    const { key } = req.body || {};
    if (!key) return res.status(400).json({ error: 'Missing key in body' });
    vault.saveSecret(key);
    return res.json({ ok: true });
  } catch (e) {
    console.error('Failed to save vault key', e && e.message);
    return res.status(500).json({ error: 'Failed to save key' });
  }
});

// Retrieve the stored secret
router.get('/vault', (req, res) => {
  try {
    const secret = vault.getSecret();
    if (!secret) return res.status(404).json({ error: 'No secret stored' });
    return res.json({ key: secret });
  } catch (e) {
    console.error('Failed to read vault', e && e.message);
    return res.status(500).json({ error: 'Failed to read key' });
  }
});

router.delete('/vault', (req, res) => {
  try {
    vault.clearSecret();
    return res.json({ ok: true });
  } catch (e) {
    console.error('Failed to clear vault', e && e.message);
    return res.status(500).json({ error: 'Failed to clear key' });
  }
});

module.exports = router;
