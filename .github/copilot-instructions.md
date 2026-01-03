# Repository guidance for AI coding agents

This file contains concise, project-specific guidance to help AI coding agents be productive quickly.

1) Big picture
- Purpose: lightweight Express API that captures website leads, persists them to a JSON file, and notifies a business owner via WhatsApp using either Twilio or Meta (Graph API).
- Core flows: HTTP POST /api/leads -> validation (`src/validators/leadValidator.js`) -> persistence (`src/db.js` writes `data/leads.json`) -> notifier (`src/notifier/*`).

2) Key files & components
- `src/app.js`: app wiring. Note: webhooks are mounted with `express.raw` for signature validation.
- `src/server.js`: entrypoint used by `npm start` / `npm run dev`.
- `src/db.js`: synchronous file-based persistence; DB file path overridable with `DATABASE_URL`.
- `src/notifier/index.js`: selects provider via `NOTIFIER_PROVIDER` or available env vars; providers: `src/notifier/twilio.js` and `src/notifier/meta.js`.
- `src/routes/leads.js`: lead creation + notifier usage (supports template sending via env vars).
- `src/routes/admin.js` + `src/middleware/adminAuth.js`: admin API protected by `ADMIN_API_KEY` (header `x-admin-key` or `Authorization: Bearer <key>`).
- `src/vault.js`: AES-256-GCM server-side vault for a single secret; requires `VAULT_MASTER_KEY`. Vault file defaults to `data/vault.json` and is written with mode `0600`.

3) Environment variables (most important)
- `ADMIN_API_KEY` — required for admin endpoints.
- `VAULT_MASTER_KEY` — required for vault operations; code warns if missing.
- `NOTIFIER_PROVIDER` — `meta` | `twilio` (optional; auto-detected if not set).
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `OWNER_WHATSAPP_TO`.
- Meta: `META_PHONE_NUMBER_ID`, `META_WHATSAPP_TOKEN`, `OWNER_WHATSAPP_TO`, and optional template envs (`NOTIFIER_TEMPLATE_NAME`, `NOTIFIER_TEMPLATE_PARAMS`, `NOTIFIER_TEMPLATE_LANG`).
- `DATABASE_URL` — override `data/leads.json` path.

3a) Env file template
- A ready-to-edit `.env.example` is included at the project root. Use it to bootstrap local runs and CI.
- Key entries shown in `.env.example`:

```
# Server
PORT=3000
ADMIN_API_KEY=changeme
VAULT_MASTER_KEY=your-strong-master-key
DATABASE_URL=./data/leads.json

# Notifier provider (optional)
NOTIFIER_PROVIDER=meta

# Twilio (if using Twilio)
TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=+1415XXXXXXX
OWNER_WHATSAPP_TO=+1555XXXXXXX

# Meta / WhatsApp Business API (if using Meta)
META_PHONE_NUMBER_ID=123456789012345
META_WHATSAPP_TOKEN=EAAG...your_token_here
META_VERIFY_TOKEN=webhook_verify_token
META_APP_SECRET=your_app_secret

# Optional: send Meta template instead of plain text (comma-separated lead fields)
NOTIFIER_TEMPLATE_NAME=lead_alert_template
NOTIFIER_TEMPLATE_PARAMS=name,email,phone
NOTIFIER_TEMPLATE_LANG=en_US
```

- `NOTIFIER_TEMPLATE_PARAMS` maps CSV fields to template body parameters in `src/routes/leads.js`. Missing lead fields use `NOTIFIER_TEMPLATE_FALLBACK` if set.

4) Important runtime behaviors & conventions
- Notifications are best-effort and non-blocking: the lead POST returns after persistence; notifier errors are logged.
- If provider env vars are missing, notifier functions return `null` (no-op). Tests and local runs will still persist leads.
- `src/db.js` uses synchronous `fs` operations — avoid adding long-running sync work on hot paths.
- Webhook routes require raw body parsing; don't replace with `express.json()` for `/webhooks`.

5) Tests, scripts & dev workflow
- Run locally: `npm install` then `npm run dev` (uses `nodemon`).
- Tests: `npm test` (Jest + Supertest; tests live in `tests/*.test.js`).

6) Safe changes & integration notes for contributors
- When modifying notification logic, keep `src/notifier/index.js` provider selection and fallbacks intact — many deployments rely on env detection.
- Template sending: `src/routes/leads.js` builds template body parameters from `NOTIFIER_TEMPLATE_PARAMS`. Use that convention when adding template fields.
- Admin UI: `public/admin.html` expects an `ADMIN_API_KEY` to be pasted by the operator — do not change the path unless updating static serving in `src/app.js`.
- Vault usage: require `VAULT_MASTER_KEY` in environment for server-side secret storage. `src/vault.js` throws if master key missing.

7) Troubleshooting hints for agents
- To reproduce missing sends locally, unset Twilio/Meta envs — notifier will be a no-op. Look at console logs for `Meta notifier:` or `WhatsApp send error`.
- For webhook signature issues, ensure requests use raw JSON body and verify `X-Hub-Signature-256` handling in `src/routes/webhooks.js` (mounted in `src/app.js`).
- For file permission issues with the vault file, check `data/` ownership and the `0o600` write mode used in `src/vault.js`.

8) What not to change without coordination
- Don't convert data persistence from JSON file to DB without updating README, tests, and `DATABASE_URL` handling.
- Avoid converting synchronous file IO in `src/db.js` to async without considering test timing and ordering.

If anything here is unclear or you want more examples (e.g., common PR changes, test harnesses to run, or sample env files), tell me which area to expand. 
