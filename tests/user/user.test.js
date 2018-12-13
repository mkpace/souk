import axios from 'axios';
import { expect } from 'chai';

import { User } from '../../functions/user/models/user.model';
import {
  MOCK_ADMIN,
  MOCK_USER,
  UPDATE_MOCK_USER,
  MOCK_IMAGE_ENCODED,
  UPDATED_STATUS,
} from './mock';

const BASE_URL = 'http://localhost:3000/user';

describe('User API', async () => {
  let authToken;
  let userId;

  before(async () => {
    await User.deleteMany({});
    await User.create(MOCK_ADMIN);
  });

  it('get authentication token - [post] /auth/signin', async () => {
    const res = await axios.post(
      'http://localhost:3000/auth/signin',
      {
        email: MOCK_ADMIN.email,
        password: MOCK_ADMIN.password,
      },
    );

    authToken = res.data.token;
  });

  it('upload avatar - [post] /user/avatar', async () => {
    const res = await axios.post(
      `${BASE_URL}/avatar`,
      {
        avatar: MOCK_IMAGE_ENCODED,
      },
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );
    expect(res.status).to.eq(200);
  });

  it('add user - [post] /user', async () => {
    const res = await axios.post(
      BASE_URL,
      MOCK_USER,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.first_name).to.eq(MOCK_USER.first_name);
    expect(data.last_name).to.eq(MOCK_USER.last_name);
    expect(data.username).to.eq(MOCK_USER.username);
    expect(data.email).to.eq(MOCK_USER.email);

    // ensure sensitive information not to be included
    expect(data).to.not.have.property('passwordHash');
    expect(data).to.not.have.property('pin');
    expect(data).to.not.have.property('deleted');

    userId = data._id; /* eslint no-underscore-dangle: 0 */
  });

  it('validation for duplicate username - [post] /user', async () => {
    try {
      await axios.post(
        BASE_URL,
        MOCK_USER,
        {
          headers: {
            Authorization: `bearer ${authToken}`,
          },
        },
      );
    } catch (e) {
      expect(e.response.status).to.eq(400);
    }
  });

  it('update user - [put] /user/:id', async () => {
    const res = await axios.put(
      `${BASE_URL}/${userId}`,
      UPDATE_MOCK_USER,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.first_name).to.eq(UPDATE_MOCK_USER.first_name);
    expect(data.last_name).to.eq(UPDATE_MOCK_USER.last_name);
    expect(data.email).to.eq(UPDATE_MOCK_USER.email);

    // ensure sensitive information not to be included
    expect(data).to.not.have.property('passwordHash');
    expect(data).to.not.have.property('pin');
    expect(data).to.not.have.property('deleted');
  });

  it('update a user status - [put] /user/status/:id', async () => {
    const res = await axios.put(
      `${BASE_URL}/status/${userId}`,
      { status: UPDATED_STATUS },
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.eq('success');
  });

  it('change password - [put] /user/:id/changePassword', async () => {
    try {
      const res = await axios.put(
        `${BASE_URL}/${userId}/changePassword`,
        { password: 'new password' },
        {
          headers: {
            Authorization: `bearer ${authToken}`,
          },
        },
      );
      const { data } = res;

      expect(res.status).to.eq(200);
      expect(data).to.eq('success');
    } catch (err) {
      console.log(err); // eslint-disable-line
    }
  });

  it('get all users - [get] /user', async () => {
    const res = await axios.get(
      `${BASE_URL}`,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);

    expect(data).to.have.property('total');
    expect(data).to.have.property('page');
    expect(data).to.have.property('count');
    expect(data).to.have.property('users');
    expect(data.users).to.be.a('array');
  });

  it('soft delete user - [delete] /user/:id', async () => {
    const res = await axios.delete(
      `${BASE_URL}/${userId}`,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );

    expect(res.status).to.eq(200);
    expect(res.data).to.eq('success');
  });
});
