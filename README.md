# Lead-capture-WhatsApp-alert-API
Website leads get delayed follow-ups | Business owners miss enquiries | No instant notification system | Capture leads from website / landing page  Store lead details | Instantly send WhatsApp alert to business owner | Optional: Send auto-reply to customer

Quickstart
---------

Install dependencies and run the server locally:

```bash
npm install
npm run dev
```

Run tests:

```bash
npm test
```

The POST /api/leads endpoint accepts JSON with `name`, `email`, `phone`, and optional `message`.

Environment
-----------

To enable Twilio WhatsApp alerts, set these environment variables:

- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_WHATSAPP_FROM` - Twilio WhatsApp sender number (e.g. +1415...)
- `OWNER_WHATSAPP_TO` - Business owner WhatsApp number (e.g. +1555...)

Meta (WhatsApp Business API)
-----------------------------

- `META_PHONE_NUMBER_ID` - your WhatsApp Business Phone Number ID (used in Graph API path)
- `META_WHATSAPP_TOKEN` - access token for the Graph API
- You can control provider selection with `NOTIFIER_PROVIDER` = `meta` or `twilio`.

Template parameters
-------------------

You can send a Meta template when a lead is created by setting `NOTIFIER_TEMPLATE_NAME`. The fields passed into the template body are controlled by `NOTIFIER_TEMPLATE_PARAMS` (comma-separated list of lead properties). Default is `name,email,phone`.

Example `.env` values:

```
NOTIFIER_TEMPLATE_NAME=lead_alert_template
NOTIFIER_TEMPLATE_LANG=en_US
NOTIFIER_TEMPLATE_PARAMS=name,email,phone
```

You can override the persistence file with `DATABASE_URL` (defaults to `./data/leads.json`).

Notes
-----

If Twilio env vars are not set, sending is a no-op and leads are still persisted locally.
