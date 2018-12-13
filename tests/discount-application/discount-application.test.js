import axios from 'axios';
import { expect } from 'chai';

import { User } from '../../functions/user/models/user.model';
import {
  MOCK_USER,
  MOCK_DOCUMENT,
  MOCK_DISCOUNT_APPLICATION,
} from './mock';

const BASE_URL = 'http://localhost:3000/discount-application';

/*
 * tests begin
 */
describe('Discount Application API', async () => {
  let userId;
  let applicationId;
  let document;

  /**
   * create a test user
   */
  before(async () => {
    await User.deleteMany({});

    const user = await User.create(MOCK_USER);
    userId = user._id;
  });

  /**
   * remove test user (soft delete)
   */
  after(async () => {
    await User.findByIdAndUpdate(userId, { deleted: true });
  });

  it('post a new discount application - [post] /discount-application/user/:user_id', async () => {
    const res = await axios.post(
      `${BASE_URL}/user/${userId}`,
      MOCK_DISCOUNT_APPLICATION,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.first_name).to.eq(MOCK_DISCOUNT_APPLICATION.first_name);
    expect(data.last_name).to.eq(MOCK_DISCOUNT_APPLICATION.last_name);
    expect(data.email).to.eq(MOCK_DISCOUNT_APPLICATION.email);
    expect(data.deleted).to.eq(false);

    applicationId = data._id; /* eslint no-underscore-dangle: 0 */
  });

  it('get the list of discount applications - [get] /discount-application', async () => {
    const res = await axios.get(`${BASE_URL}`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('array');
  });

  it('upload document - [post] /discount-application/document', async () => {
    const res = await axios.post(
      `${BASE_URL}/document`,
      {
        document: MOCK_DOCUMENT,
      },
    );

    expect(res.status).to.eq(200);
    document = res.data;
  });

  it('update a discount application - [put] /discount-application/:id', async () => {
    const res = await axios.put(
      `${BASE_URL}/${applicationId}`,
      {
        document,
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.document).to.eq(document);
  });

  it('fetch the specific discount application - [get] /discount-application/:id', async () => {
    const res = await axios.get(`${BASE_URL}/${applicationId}`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.first_name).to.eq(MOCK_DISCOUNT_APPLICATION.first_name);
    expect(data.last_name).to.eq(MOCK_DISCOUNT_APPLICATION.last_name);
    expect(data.email).to.eq(MOCK_DISCOUNT_APPLICATION.email);
    expect(data.deleted).to.eq(false);
  });

  it('approve a discount application - [put] /discount-application/:id/approve', async () => {
    const res = await axios.put(
      `${BASE_URL}/${applicationId}/approve`,
    );

    expect(res.status).to.eq(200);
  });

  it('soft delete discount application - [delete] /discount-application/:id', async () => {
    const res = await axios.delete(`${BASE_URL}/${applicationId}`);

    expect(res.status).to.eq(200);
  });
});
