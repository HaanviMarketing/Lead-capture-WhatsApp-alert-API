const express = require('express');
const router = express.Router();
const db = require('../db');

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

module.exports = router;
