import axios from 'axios';
import { expect } from 'chai';

import { User } from '../../functions/user/models/user.model';
import {
  MOCK_USER,
  UPDATE_MOCK_USER,
  NEW_PASSWORD,
  MOCK_IMAGE_ENCODED,
} from './mock';

const BASE_URL = 'http://localhost:3000/account';

describe('Account API', async () => {
  let token = '';

  before(async () => {
    await User.deleteMany({});
  });

  after(async () => {
    await User.findOneAndUpdate({ email: MOCK_USER.email }, { deleted: true });
  });

  it('register a new user - [post] /auth/signup', async () => {
    const res = await axios.post(
      'http://localhost:3000/auth/signup',
      MOCK_USER,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');
    expect(data).to.have.property('token');

    ({ token } = data);
  });

  it('get profile information - [get] /account/me', async () => {
    const res = await axios.get(
      `${BASE_URL}/me`,
      {
        headers: {
          Authorization: `bearer ${token}`,
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
  });

  it('update profile information - [put] /account/', async () => {
    const res = await axios.put(
      `${BASE_URL}/`,
      UPDATE_MOCK_USER,
      {
        headers: {
          Authorization: `bearer ${token}`,
        },
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');
    expect(data).to.have.property('token');

    ({ token } = data);
  });

  it('change password - [post] /account/password', async () => {
    const res = await axios.post(
      `${BASE_URL}/password`,
      {
        currentPassword: MOCK_USER.password,
        newPassword: NEW_PASSWORD,
        verifyPassword: NEW_PASSWORD,
      },
      {
        headers: {
          Authorization: `bearer ${token}`,
        },
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.eq('Password changed successfully');
  });

  it('change profile picture - [post] /account/picture', async () => {
    const res = await axios.post(
      `${BASE_URL}/picture`,
      {
        photo: MOCK_IMAGE_ENCODED,
      },
      {
        headers: {
          Authorization: `bearer ${token}`,
        },
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');
    expect(data).to.have.property('image');
  });
});
