const axios = require('axios');

const phoneNumberId = process.env.META_PHONE_NUMBER_ID; // WhatsApp Business phone number ID
const token = process.env.META_WHATSAPP_TOKEN; // Graph API token
const ownerTo = process.env.OWNER_WHATSAPP_TO;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function requestWithRetry(url, payload, headers, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await axios.post(url, payload, { headers, timeout: 5000 });
      return res;
    } catch (err) {
      lastErr = err;
      const backoff = 200 * Math.pow(2, i);
      console.warn(`Meta notifier attempt ${i + 1} failed, retrying in ${backoff}ms`);
      await delay(backoff);
    }
  }
  throw lastErr;
}

async function sendWhatsApp(lead) {
  if (!phoneNumberId || !token || !ownerTo) {
    return null; // not configured
  }

  const url = `https://graph.facebook.com/v15.0/${phoneNumberId}/messages`;

  const body = `New lead:\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone}${lead.message ? `\nMessage: ${lead.message}` : ''}`;

  const payload = {
    messaging_product: 'whatsapp',
    to: ownerTo,
    type: 'text',
    text: { body }
  };

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  console.log('Meta notifier: sending plain text message');
  return requestWithRetry(url, payload, headers);
}

// Send a template message using WhatsApp templates configured in Meta Business Manager.
// templateName: string, language: { code: 'en_US' }, components: array (optional)
async function sendTemplate({ to = ownerTo, templateName, language = { code: 'en_US' }, components = [] } = {}) {
  if (!phoneNumberId || !token || !to || !templateName) return null;

  const url = `https://graph.facebook.com/v15.0/${phoneNumberId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language,
      components
    }
  };

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  console.log(`Meta notifier: sending template ${templateName} to ${to}`);
  return requestWithRetry(url, payload, headers);
}

module.exports = { sendWhatsApp, sendTemplate };
