const path = require('path');
const fs = require('fs');

const dbFile = process.env.DATABASE_URL || path.join(__dirname, '..', 'data', 'leads.json');

let state = null;

function load() {
  if (state) return state;
  const dir = path.dirname(dbFile);
  fs.mkdirSync(dir, { recursive: true });
  try {
    const raw = fs.readFileSync(dbFile, 'utf8');
    state = JSON.parse(raw);
  } catch (e) {
    state = { leads: [], lastId: 0 };
    fs.writeFileSync(dbFile, JSON.stringify(state, null, 2));
  }
  return state;
}

function persist() {
  fs.writeFileSync(dbFile, JSON.stringify(state, null, 2));
}

function createLead({ name, email, phone, message }) {
  const db = load();
  const now = new Date().toISOString();
  db.lastId = (db.lastId || 0) + 1;
  const lead = { id: db.lastId, name, email, phone, message: message || null, createdAt: now };
  db.leads.push(lead);
  persist();
  return lead;
}

function getLeadById(id) {
  const db = load();
  return db.leads.find((l) => l.id === id) || null;
}

function addWebhookEvent(event) {
  const db = load();
  db.webhookEvents = db.webhookEvents || [];
  db.webhookEvents.push({ id: Date.now(), receivedAt: new Date().toISOString(), event });
  persist();
}

function addDeliveryStatus(status) {
  const db = load();
  db.deliveryStatuses = db.deliveryStatuses || [];
  db.deliveryStatuses.push(Object.assign({ id: Date.now(), receivedAt: new Date().toISOString() }, status));
  persist();
}

function getAllLeads() {
  const db = load();
  return db.leads || [];
}

function getDeliveryStatuses() {
  const db = load();
  return db.deliveryStatuses || [];
}

function getWebhookEvents() {
  const db = load();
  return db.webhookEvents || [];
}

module.exports = { createLead, getLeadById, addWebhookEvent, addDeliveryStatus, getAllLeads, getDeliveryStatuses, getWebhookEvents };
