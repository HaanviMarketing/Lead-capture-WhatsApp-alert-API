const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STORE_PATH = process.env.VAULT_FILE || path.join(__dirname, '..', 'data', 'vault.json');

function getKeyFromMaster(master) {
  // derive 32-byte key from master string
  return crypto.createHash('sha256').update(String(master || '')).digest();
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function encrypt(text, master) {
  if (!master) throw new Error('VAULT_MASTER_KEY is required');
  const key = getKeyFromMaster(master);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function decrypt(payload, master) {
  if (!master) throw new Error('VAULT_MASTER_KEY is required');
  const b = Buffer.from(payload, 'base64');
  const iv = b.slice(0, 12);
  const tag = b.slice(12, 28);
  const enc = b.slice(28);
  const key = getKeyFromMaster(master);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const out = Buffer.concat([decipher.update(enc), decipher.final()]);
  return out.toString('utf8');
}

function saveSecret(secret) {
  const master = process.env.VAULT_MASTER_KEY;
  if (!master) throw new Error('VAULT_MASTER_KEY not configured');
  ensureDir(STORE_PATH);
  const payload = encrypt(secret, master);
  fs.writeFileSync(STORE_PATH, JSON.stringify({ v: payload }, null, 2), { mode: 0o600 });
}

function getSecret() {
  const master = process.env.VAULT_MASTER_KEY;
  if (!master) throw new Error('VAULT_MASTER_KEY not configured');
  if (!fs.existsSync(STORE_PATH)) return null;
  const raw = fs.readFileSync(STORE_PATH, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.v) return null;
    return decrypt(parsed.v, master);
  } catch (e) {
    throw new Error('Failed to read vault');
  }
}

function clearSecret() {
  if (fs.existsSync(STORE_PATH)) fs.unlinkSync(STORE_PATH);
}

module.exports = { saveSecret, getSecret, clearSecret };
