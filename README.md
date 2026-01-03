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

You can override the persistence file with `DATABASE_URL` (defaults to `./data/leads.json`).

Notes
-----

If Twilio env vars are not set, sending is a no-op and leads are still persisted locally.
