const express = require('express');
const { validateLead } = require('../validators/leadValidator');
const db = require('../db');
const notifier = require('../notifier/twilio');

const router = express.Router();

router.post('/', async (req, res) => {
  const { error, value } = validateLead(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const lead = db.createLead(value);

    // send WhatsApp alert (if configured). Do not block on result.
    notifier.sendWhatsApp(lead).catch((err) => console.error('WhatsApp send error:', err && err.message));

    return res.status(201).json({ data: lead });
  } catch (err) {
    console.error('Failed to create lead:', err);
    return res.status(500).json({ error: 'Failed to save lead' });
  }
});

module.exports = router;
