const express = require('express');
const router = express.Router();

// Meta delivery/webhook endpoint
router.post('/meta', (req, res) => {
  // Meta sends an array of entry/changes — log for now and respond 200
  try {
    console.log('Meta webhook received:', JSON.stringify(req.body));
  } catch (e) {
    console.error('Failed to log webhook body');
  }
  // TODO: validate signature if available (X-Hub-Signature-256) using app secret
  res.sendStatus(200);
});

module.exports = router;
