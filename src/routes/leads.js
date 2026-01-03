const express = require('express');
const { validateLead } = require('../validators/leadValidator');
const db = require('../db');
const notifier = require('../notifier');

const router = express.Router();

router.post('/', async (req, res) => {
  const { error, value } = validateLead(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const lead = db.createLead(value);

    // send WhatsApp alert (if configured). Do not block on result.
    // If NOTIFIER_TEMPLATE_NAME is set, send using a template (Meta template example).
    const templateName = process.env.NOTIFIER_TEMPLATE_NAME;
    if (templateName) {
      // Build template components from NOTIFIER_TEMPLATE_PARAMS (comma-separated lead fields)
      const paramList = (process.env.NOTIFIER_TEMPLATE_PARAMS || 'name,email,phone')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const fallbackValue = process.env.NOTIFIER_TEMPLATE_FALLBACK ?? '';

      const bodyParameters = paramList.map((field) => {
        const exists = Object.prototype.hasOwnProperty.call(lead, field);
        if (!exists) console.warn(`Template field "${field}" not found on lead; using fallback value`);
        const value = exists ? lead[field] : fallbackValue;
        return { type: 'text', text: String(value ?? '') };
      });

      const template = {
        templateName,
        language: { code: process.env.NOTIFIER_TEMPLATE_LANG || 'en_US' },
        components: [
          {
            type: 'body',
            parameters: bodyParameters
          }
        ]
      };

      notifier.sendWhatsApp(lead, { template }).catch((err) => console.error('WhatsApp template send error:', err && err.message));
    } else {
      notifier.sendWhatsApp(lead).catch((err) => console.error('WhatsApp send error:', err && err.message));
    }

    return res.status(201).json({ data: lead });
  } catch (err) {
    console.error('Failed to create lead:', err);
    return res.status(500).json({ error: 'Failed to save lead' });
  }
});

module.exports = router;
