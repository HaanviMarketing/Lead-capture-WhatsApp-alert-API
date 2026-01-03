const express = require('express');
const router = express.Router();

// POST /api/preview-template
// Body: { lead: { ... }, templateName?: string, language?: { code }, params?: 'a,b,c', to?: 'number' }
router.post('/preview-template', (req, res) => {
  const lead = req.body.lead || {};
  const templateName = req.body.templateName || process.env.NOTIFIER_TEMPLATE_NAME;
  const language = req.body.language || { code: process.env.NOTIFIER_TEMPLATE_LANG || 'en_US' };
  const to = req.body.to || process.env.OWNER_WHATSAPP_TO || '';

  // params can be provided in body or via env
  const paramList = (req.body.params || process.env.NOTIFIER_TEMPLATE_PARAMS || 'name,email,phone')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const fallbackValue = req.body.fallback ?? process.env.NOTIFIER_TEMPLATE_FALLBACK ?? '';

  const bodyParameters = paramList.map((field) => {
    const exists = Object.prototype.hasOwnProperty.call(lead, field);
    const value = exists ? lead[field] : fallbackValue;
    return { type: 'text', text: String(value ?? '') };
  });

  if (!templateName) {
    // return plain-text preview
    const textBody = `Preview message:\n${paramList.map((f, i) => `${f}: ${bodyParameters[i].text}`).join('\n')}`;
    const payload = { messaging_product: 'whatsapp', to, type: 'text', text: { body: textBody } };
    return res.json({ preview: payload });
  }

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language,
      components: [
        {
          type: 'body',
          parameters: bodyParameters
        }
      ]
    }
  };

  return res.json({ preview: payload });
});

module.exports = router;
