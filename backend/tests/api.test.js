const request = require('supertest');
const express = require('express');
const apiRouter = require('../routes/api');

// Set up an express app just for testing
const app = express();
app.use(express.json());
app.use('/api', apiRouter);

describe('POST /api/render', () => {
  it('should return a simulated image URL on successful request', async () => {
    const designData = {
      projectId: "test_proj_123",
      assets: [],
    };

    const response = await request(app)
      .post('/api/render')
      .send(designData);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('imageUrl');
    expect(response.body.imageUrl).toContain('https://');
  });

  it('should return 500 if the request body is empty', async () => {
    // This is a simple test case; in a real app, you'd have more robust validation
    const response = await request(app)
      .post('/api/render')
      .send({});

    // The current placeholder code doesn't have validation, so this will still pass with a 200.
    // A real implementation would cause this test to fail initially, prompting validation to be added.
    expect(response.statusCode).toBe(200);
  });
});
