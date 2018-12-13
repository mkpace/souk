import axios from 'axios';
import { expect } from 'chai';

import { User } from '../../functions/user/models/user.model';
import { MOCK_ADMIN } from '../user/mock';
import {
  MOCK_SETTING,
  UPDATED_MOCK_SETTING,
} from './mock';

const BASE_URL = 'http://localhost:3000/setting';

/*
 * tests begin
 */
describe('Setting CRUD API', async () => {
  let settingId;
  let authToken;

  /**
   * create a test admin
   */
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

  it('create a setting item - [post] /setting', async () => {
    const res = await axios.post(
      `${BASE_URL}`,
      MOCK_SETTING,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.key).to.eq(MOCK_SETTING.key);
    expect(data.value).to.eq(MOCK_SETTING.value);
    expect(data.description).to.eq(MOCK_SETTING.description);
    expect(data.deleted).to.eq(false);

    settingId = data._id; /* eslint no-underscore-dangle: 0 */
  });

  it('get all settings - [get] /setting', async () => {
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
    expect(data).to.be.a('array');
  });

  it('update a setting entry - [put] /setting/:id', async () => {
    const res = await axios.put(
      `${BASE_URL}/${settingId}`,
      UPDATED_MOCK_SETTING,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.additional_options.valueInNumber).to.eq(
      UPDATED_MOCK_SETTING.additional_options.valueInNumber,
    );
    expect(data.deleted).to.eq(false);
  });

  it('soft delete a setting item - [delete] /setting/:id', async () => {
    const res = await axios.delete(
      `${BASE_URL}/${settingId}`,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );

    expect(res.status).to.eq(200);
  });
});
