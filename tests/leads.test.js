process.env.DATABASE_URL = ':memory:';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');

describe('POST /api/leads', () => {
  it('returns 201 and created lead for valid payload', async () => {
    const payload = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+15551234567',
      message: 'Interested in your services'
    };

    const res = await request(app).post('/api/leads').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toMatchObject({ name: payload.name, email: payload.email, phone: payload.phone });
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app).post('/api/leads').send({ email: 'no-name@example.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
