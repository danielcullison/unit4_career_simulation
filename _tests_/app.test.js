const request = require('supertest');
const app = require('../server.js');
const client = require('../db/client.js');


jest.mock('../db/client.js');

beforeAll(async () => {
  await client.connect();
});

afterAll(async () => {
  await client.end();
});

describe('API Tests', () => {
  let token;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'test@example.com', password: 'password' });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    token = loginResponse.body.token;
  });

  test("GET /api/v1/items should return items", async () => {
    const response = await request(app)
      .get("/api/v1/items")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  test("GET /api/v1/items/:id should return a single item", async () => {
    const response = await request(app)
      .get("/api/v1/items/1")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
  });

  test("POST /api/auth/register should create a user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        username: "newuser",
        email: "new@example.com",
        password: "password",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("username", "newuser");
  });

  test("POST /api/auth/login should return a token", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  test("GET /api/auth/me should return the logged-in user", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("username", "testuser");
  });

  test("DELETE /api/v1/users/:user_id/reviews/:id should delete a review", async () => {
    const reviewResponse = await request(app)
      .post("/api/v1/users/1/reviews")
      .set("Authorization", token)
      .send({ item_id: 1 });

    const reviewId = reviewResponse.body.review.id;

    const deleteResponse = await request(app)
      .delete(`/api/v1/users/1/reviews/${reviewId}`)
      .set("Authorization", token);

    expect(deleteResponse.status).toBe(204);
  });
});
