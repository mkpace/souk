import axios from 'axios';
import { expect } from 'chai';

import { Coupon } from '../../functions/coupon/models/coupon.model';
import { MOCK_COUPON, UPDATED_MOCK_COUPON } from './mock';

const BASE_URL = 'http://localhost:3000/coupon';

/*
 * tests begin
 */
describe('Coupon CRUD API', async () => {
  let couponId;

  before(async () => {
    await Coupon.deleteMany({});
  });

  it('add a coupon - [post] /coupon', async () => {
    const res = await axios.post(`${BASE_URL}`, MOCK_COUPON);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.amount).to.eq(MOCK_COUPON.amount);
    expect(data.deleted).to.eq(false);

    couponId = data._id; /* eslint no-underscore-dangle: 0 */
  });

  it('fail to add duplicated coupon code - [post] /coupon', async () => {
    try {
      await axios.post(`${BASE_URL}`, MOCK_COUPON);
    } catch (err) {
      expect(err.response.status).to.eq(400);
    }
  });

  it('get the list of coupons - [get] /coupon', async () => {
    const res = await axios.get(`${BASE_URL}`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('array');
  });

  it('get the coupon from code - [get] /coupon/code/:code', async () => {
    const res = await axios.get(`${BASE_URL}/code/${MOCK_COUPON.code}`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.amount).to.eq(MOCK_COUPON.amount);
    expect(data.code).to.eq(MOCK_COUPON.code);
    expect(data.deleted).to.eq(false);
    // expect(data).to.be.a('array');
  });

  it('update a coupon item - [put] /coupon/:id', async () => {
    const res = await axios.put(`${BASE_URL}/${couponId}`, UPDATED_MOCK_COUPON);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.amount).to.eq(UPDATED_MOCK_COUPON.amount);
    expect(data.deleted).to.eq(false);
  });

  it('soft delete a coupon item - [delete] /coupon/:id', async () => {
    const res = await axios.delete(`${BASE_URL}/${couponId}`);

    expect(res.status).to.eq(200);
  });
});
