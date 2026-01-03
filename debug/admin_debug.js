const request = require('supertest');
const app = require('../src/app');
(async () => {
  process.env.ADMIN_API_KEY = 'adminkey';
  console.log('Posting lead...');
  const p = await request(app).post('/api/leads').send({ name: 'Eve', email: 'eve@example.com', phone: '+300' });
  console.log('POST res status', p.status, 'body', p.body);
  const g = await request(app).get('/admin/leads').set('x-admin-key', 'adminkey');
  console.log('GET res status', g.status, 'bodyKeys', Object.keys(g.body), 'leadsLen', g.body.leads && g.body.leads.length);
})();