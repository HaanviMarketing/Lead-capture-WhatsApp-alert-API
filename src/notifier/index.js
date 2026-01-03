// Aggregator notifier: choose provider via NOTIFIER_PROVIDER or by available env vars
const twilio = require('./twilio');
const meta = require('./meta');

const providerEnv = process.env.NOTIFIER_PROVIDER && process.env.NOTIFIER_PROVIDER.toLowerCase();

function chooseProvider() {
  if (providerEnv === 'meta') return meta;
  if (providerEnv === 'twilio') return twilio;

  if (process.env.META_PHONE_NUMBER_ID && process.env.META_WHATSAPP_TOKEN && process.env.OWNER_WHATSAPP_TO) return meta;
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM && process.env.OWNER_WHATSAPP_TO) return twilio;

  return twilio;
}

const provider = chooseProvider();

async function sendWhatsApp(lead, options) {
  try {
    if (options && options.template && provider.sendTemplate) {
      return await provider.sendTemplate(options.template);
    }
    return await provider.sendWhatsApp(lead);
  } catch (err) {
    console.error('Notifier error:', err && err.message);
    throw err;
  }
}

module.exports = { sendWhatsApp };
