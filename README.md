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

Webhook verification
--------------------

To configure Meta webhook verification set `META_VERIFY_TOKEN` to a value you provide when registering the webhook. Meta will call the GET verification endpoint and expect the `hub.challenge` returned.

For request signing, set `META_APP_SECRET` (your app secret) and the server will validate `X-Hub-Signature-256` for incoming POST webhook calls.

You can override the persistence file with `DATABASE_URL` (defaults to `./data/leads.json`).

Notes
-----

If Twilio env vars are not set, sending is a no-op and leads are still persisted locally.

Admin UI
--------

You can view leads and delivery statuses in the browser at `/admin/ui/admin.html` (e.g. `http://localhost:3000/admin/ui/admin.html`). Paste your `ADMIN_API_KEY` into the input and click "Load" to fetch data.

Vault (server-side encrypted storage)
------------------------------------

This project includes a simple server-side encrypted vault to store a single secret (for example an API key) used by the admin UI. It uses AES-256-GCM and requires a master key.

- Env vars:
	- `VAULT_MASTER_KEY` (required) — master key used to derive the encryption key.
	- `VAULT_FILE` (optional) — path to the vault file (defaults to `data/vault.json`).

- Admin endpoints (require `ADMIN_API_KEY`, send via `x-admin-key` or `Authorization: Bearer <key>`):
	- `POST /admin/vault` { "key": "secret" } — store encrypted secret on server.
	- `GET /admin/vault` — retrieve stored secret (returns `{ "key": "..." }`).
	- `DELETE /admin/vault` — clear stored secret.

- Example (replace `<ADMIN_KEY>` and `<SECRET>`):

```bash
curl -X POST http://localhost:3000/admin/vault \
	-H "x-admin-key: <ADMIN_KEY>" \
	-H "Content-Type: application/json" \
	-d '{"key":"<SECRET>"}'

curl -X GET http://localhost:3000/admin/vault -H "x-admin-key: <ADMIN_KEY>"
curl -X DELETE http://localhost:3000/admin/vault -H "x-admin-key: <ADMIN_KEY>"
```

Security notes:
- Ensure `VAULT_MASTER_KEY` is set in production. Without it vault endpoints will throw.
- The vault file is created with restrictive permissions (0600) by default.
- Prefer storing `VAULT_MASTER_KEY` in a dedicated secrets manager rather than environment variables if possible.

If you want vault master-key rotation or an automated migration helper, I can add a safe rotate endpoint.
