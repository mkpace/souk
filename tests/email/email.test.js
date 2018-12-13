import axios from 'axios';
import { expect } from 'chai';

import {
  MOCK_EMAIL1,
  MOCK_EMAIL2,
  MOCK_EMAIL3,
} from './mock';

const BASE_URL = 'http://localhost:3000/email';

/*
 * tests begin
 */
describe('Email Template Service API', async () => {
  it('send an email to multiple recipients - [post] /email/send', async () => {
    const res = await axios.post(
      `${BASE_URL}/send`,
      MOCK_EMAIL1,
    );

    expect(res.status).to.eq(200);
    expect(res.data).to.eq('success');
  });

  it('send an email to users filtered by DB query - [post] /email/send', async () => {
    const res = await axios.post(
      `${BASE_URL}/send`,
      MOCK_EMAIL2,
    );

    expect(res.status).to.eq(200);
    expect(res.data).to.eq('success');
  });

  it('send a custom email to users - [post] /email/send', async () => {
    const res = await axios.post(
      `${BASE_URL}/send`,
      MOCK_EMAIL3,
    );

    expect(res.status).to.eq(200);
    expect(res.data).to.eq('success');
  });
});
