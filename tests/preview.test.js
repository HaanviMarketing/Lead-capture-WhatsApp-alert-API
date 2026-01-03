const request = require('supertest');
const app = require('../src/app');

describe('POST /api/preview-template', () => {
  it('returns template preview payload when templateName provided', async () => {
    const lead = { name: 'Alice', email: 'alice@example.com', phone: '+100000' };
    const res = await request(app)
      .post('/api/preview-template')
      .send({ lead, templateName: 'lead_template', params: 'name,email,phone' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('preview');
    expect(res.body.preview).toHaveProperty('type', 'template');
    expect(res.body.preview.template).toHaveProperty('name', 'lead_template');
  });

  it('returns text preview when no template configured', async () => {
    const lead = { name: 'Bob', email: 'bob@example.com', phone: '+200000' };
    const res = await request(app).post('/api/preview-template').send({ lead, params: 'name,phone' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('preview');
    expect(res.body.preview).toHaveProperty('type');
  });
});
