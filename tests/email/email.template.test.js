import axios from 'axios';
import { expect } from 'chai';
import fs from 'fs';

import { User } from '../../functions/user/models/user.model';
import { MOCK_ADMIN } from '../user/mock';
import {
  MOCK_EMAIL_TEMPLATE,
  UPDATED_MOCK_EMAIL_TEMPLATE,
} from './mock';

const BASE_URL = 'http://localhost:3000/email/template';

/*
 * tests begin
 */
describe('Email Template CRUD API', async () => {
  let templateId;
  let authToken;

  function base64Encode(text) {
    // read binary data
    const binary = fs.readFileSync(text);

    // convert binary data to base64 encoded string
    return Buffer.from(binary).toString('base64');
  }

  /**
   * create a test product
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

  it('upload template to s3 - [post] /email/template/upload', async () => {
    const mockTemplate = `${base64Encode('./tests/email/mock/forgot-password.html')}`;
    const res = await axios.post(
      `${BASE_URL}/upload`,
      { template: mockTemplate },
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );

    expect(res.status).to.eq(200);
    MOCK_EMAIL_TEMPLATE.url = res.data;
  });

  it('create an email template - [post] /email/template', async () => {
    const res = await axios.post(
      `${BASE_URL}`,
      MOCK_EMAIL_TEMPLATE,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.name).to.eq(MOCK_EMAIL_TEMPLATE.name);
    expect(data.from).to.eq(MOCK_EMAIL_TEMPLATE.from);
    expect(data.type).to.eq(MOCK_EMAIL_TEMPLATE.type);
    expect(data.deleted).to.eq(false);

    templateId = data._id; /* eslint no-underscore-dangle: 0 */
  });

  it('get all email templates - [get] /email/template', async () => {
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

  it('update an email template - [put] /email/template/:id', async () => {
    const res = await axios.put(
      `${BASE_URL}/${templateId}`,
      UPDATED_MOCK_EMAIL_TEMPLATE,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.name).to.eq(UPDATED_MOCK_EMAIL_TEMPLATE.name);
    expect(data.deleted).to.eq(false);
  });

  it('soft delete an email template - [delete] /email/template/:id', async () => {
    const res = await axios.delete(
      `${BASE_URL}/${templateId}`,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );

    expect(res.status).to.eq(200);
  });
});
