const request = require('supertest');
const app = require('../server');

describe('Server Routes', () => {
  test('POST /api/auth/register should require valid data', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({});
    expect(response.status).toBe(400);
  });

  test('POST /api/auth/login should require valid data', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(response.status).toBe(400);
  });
});