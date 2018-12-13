import axios from 'axios';
import { expect } from 'chai';

import { User } from '../../functions/user/models/user.model';
import {
  MOCK_USER,
} from './mock';

const BASE_URL = 'http://localhost:3000/auth';

describe('Auth API', async () => {
  before(async () => {
    await User.deleteMany({});
  });

  after(async () => {
    await User.findOneAndUpdate({ email: MOCK_USER.email }, { deleted: true });
  });

  it('register a new user - [post] /auth/signup', async () => {
    const res = await axios.post(
      `${BASE_URL}/signup`,
      MOCK_USER,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');
    expect(data).to.have.property('token');
  });

  it('sign in user by email + password - [post] /auth/signin', async () => {
    const res = await axios.post(
      `${BASE_URL}/signin`,
      {
        email: MOCK_USER.email,
        password: MOCK_USER.password,
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');
    expect(data).to.have.property('token');
  });

  it('sign in administrator by email + password - [post] /auth/signin/admin', async () => {
    try {
      await axios.post(
        `${BASE_URL}/signin/admin`,
        {
          email: MOCK_USER.email,
          password: MOCK_USER.password,
        },
      );
    } catch (err) {
      expect(err.response.status).to.eq(403);
    }
  });

  it('forgot password - [post] /auth/forgot', async () => {
    const res = await axios.post(
      `${BASE_URL}/forgot`,
      {
        email: MOCK_USER.email,
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');
    expect(data).to.have.property('message');
  });

  it('sign in user by username + password - [post] /auth/signin', async () => {
    const res = await axios.post(
      `${BASE_URL}/signin`,
      {
        email: MOCK_USER.username,
        password: MOCK_USER.password, // password reset in the previous step
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');
    expect(data).to.have.property('token');
  });
});
