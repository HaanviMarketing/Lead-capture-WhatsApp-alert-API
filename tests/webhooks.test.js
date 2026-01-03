const request = require('supertest');
const crypto = require('crypto');
const app = require('../src/app');

describe('Webhooks', () => {
  it('verifies GET challenge when verify token matches', async () => {
    process.env.META_VERIFY_TOKEN = 'verify_me';
    const res = await request(app)
      .get('/webhooks/meta')
      .query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'verify_me', 'hub.challenge': 'CHALLENGE' });
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('CHALLENGE');
  });

  it('accepts POST with valid X-Hub-Signature-256', async () => {
    const appSecret = 'testsecret';
    process.env.META_APP_SECRET = appSecret;
    const payload = JSON.stringify({ entry: [{ id: '1', changes: [] }] });
    const signature = 'sha256=' + crypto.createHmac('sha256', appSecret).update(payload).digest('hex');

    const res = await request(app)
      .post('/webhooks/meta')
      .set('x-hub-signature-256', signature)
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.statusCode).toBe(200);
  });
});
