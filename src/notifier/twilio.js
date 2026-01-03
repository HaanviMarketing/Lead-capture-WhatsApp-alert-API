const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_FROM; // e.g., +1415XXXXXXX
const to = process.env.OWNER_WHATSAPP_TO; // business owner number

let client;
if (accountSid && authToken) {
  const Twilio = require('twilio');
  client = Twilio(accountSid, authToken);
}

async function sendWhatsApp(lead) {
  if (!client || !from || !to) {
    // Not configured — skip sending
    return null;
  }

  const body = `New lead:\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone}${lead.message ? `\nMessage: ${lead.message}` : ''}`;

  return client.messages.create({
    from: `whatsapp:${from}`,
    to: `whatsapp:${to}`,
    body
  });
}

module.exports = { sendWhatsApp };
