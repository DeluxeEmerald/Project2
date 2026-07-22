const request = require('supertest');
const app = require('../server');

describe('Express API Endpoints', () => {
  describe('POST /api/login', () => {
    it('should return a 200 status and JWT', async () => {
      const payload = { name: 'test1', password: 'test' };
      const response = await request(app).post('/api/login').send(payload);

      expect(response.statusCode).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(typeof response.body.accessToken).toBe('string');
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });
  });
});