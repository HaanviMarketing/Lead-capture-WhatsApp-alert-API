const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// GET handler for webhook verification (hub.challenge)
router.get('/meta', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const verifyToken = process.env.META_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('Webhook verified');
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }
  return res.sendStatus(400);
});

// POST handler for webhook events — verify X-Hub-Signature-256 using META_APP_SECRET
router.post('/meta', (req, res) => {
  const signature = req.get('x-hub-signature-256') || req.get('X-Hub-Signature-256') || '';
  const appSecret = process.env.META_APP_SECRET;

  if (appSecret) {
    if (!signature) {
      console.warn('Missing X-Hub-Signature-256 header');
      return res.sendStatus(403);
    }

    const computed = 'sha256=' + crypto.createHmac('sha256', appSecret).update(req.body).digest('hex');
    const a = Buffer.from(computed);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      console.warn('Invalid webhook signature');
      return res.sendStatus(403);
    }
  }

  // parse JSON from raw body
  let parsed = null;
  try {
    parsed = JSON.parse(req.body.toString('utf8'));
  } catch (e) {
    console.error('Failed to parse webhook JSON', e && e.message);
    return res.sendStatus(400);
  }

  // handle webhook payload: persist event and any delivery statuses
  try {
    const db = require('../db');
    db.addWebhookEvent(parsed);

    // traverse entries/changes and collect statuses if present
    const entries = parsed.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value || {};
        const statuses = value.statuses || value.status || null;
        if (Array.isArray(statuses)) {
          for (const s of statuses) {
            db.addDeliveryStatus(s);
          }
        }
      }
    }
  } catch (e) {
    console.error('Failed to persist webhook event/status', e && e.message);
  }

  console.log('Meta webhook received:', JSON.stringify(parsed));
  return res.sendStatus(200);
});

module.exports = router;
