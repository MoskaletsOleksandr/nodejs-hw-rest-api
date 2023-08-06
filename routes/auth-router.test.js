import mongoose from 'mongoose';
import request from 'supertest';
import 'dotenv/config';
import gravatar from 'gravatar';
import bcrypt from 'bcryptjs';

import app from '../app.js';
import User from '../models/user.js';

const { PORT, DB_HOST_TEST } = process.env;

const testData = {
  email: 'example@example.com',
  password: 'examplepassword',
};

describe('test login route', () => {
  let server;
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(DB_HOST_TEST);
    server = app.listen(PORT);

    testUser = await User.findOne({ email: testData.email });

    if (!testUser) {
      const avatarURL = gravatar.url(testData.email, {
        s: '200',
        r: 'pg',
        d: 'mp',
      });
      const hashedPassword = await bcrypt.hash(testData.password, 10);

      testUser = await User.create({
        email: testData.email,
        password: hashedPassword,
        avatarURL,
      });
    }
  });

  afterAll(async () => {
    await User.findByIdAndDelete(testUser._id);

    await mongoose.connection.close();
    server.close();
  });

  test('test login with correct data', async () => {
    const response = await request(app).post('/users/login').send(testData);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toEqual(
      expect.objectContaining({
        email: expect.any(String),
        subscription: expect.any(String),
      })
    );

    const user = await User.findOne({ email: testData.email });
    expect(user.email).toBe(testData.email);
  });
});
