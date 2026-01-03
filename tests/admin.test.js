const request = require('supertest');
const app = require('../src/app');

describe('Admin endpoint', () => {
  it('requires admin key and returns leads and statuses', async () => {
    process.env.ADMIN_API_KEY = 'adminkey';

    // create a lead first
    const payload = { name: 'Eve', email: 'eve@example.com', phone: '+300000' };
    await request(app).post('/api/leads').send(payload);

    const res = await request(app).get('/admin/leads').set('x-admin-key', 'adminkey');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('leads');
    expect(Array.isArray(res.body.leads)).toBeTruthy();
    expect(res.body.leads.length).toBeGreaterThanOrEqual(1);
  });
});
