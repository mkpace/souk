import axios from 'axios';
import { expect } from 'chai';
import _ from 'lodash';

import {
  MOCK_RATE_DOMESTIC,
  MOCK_RATE_INTERNATIONAL,
  MOCK_RATE_DOMESTIC_POBOX,
} from './mock';

const BASE_URL = 'http://localhost:3000/shipping';

/*
 * tests begin
 */
describe('Shipping API', async () => {
  const buildURLQuery = obj => Object.entries(obj)
    .map(pair => pair.map(encodeURIComponent).join('='))
    .join('&');

  it('get domestic shipping rate (wholesale) - [get] /shipping/rate', async () => {
    const res = await axios.get(
      `${BASE_URL}/rate?${buildURLQuery(_.merge(MOCK_RATE_DOMESTIC, { type: 'wholesale' }))}`,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('array');
  });

  it('get international shipping rate (wholesale) - [get] /shipping/rate', async () => {
    const res = await axios.get(
      `${BASE_URL}/rate?${buildURLQuery(_.merge(MOCK_RATE_INTERNATIONAL, { type: 'wholesale' }))}`,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('array');
  });

  it('verify free shipping for orders > $5000 (wholesale) - [get] /shipping/rate?type=wholesale', async () => {
    const res = await axios.get(
      `${BASE_URL}/rate?${buildURLQuery(_.merge(MOCK_RATE_INTERNATIONAL, { type: 'wholesale', amount: 10000 }))}`,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('array');

    _.each(data, (item) => {
      expect(item.rate).to.eq(0.00);
    });
  });

  it('get rate (retail) - [get] /shipping/rate', async () => {
    const res = await axios.get(
      `${BASE_URL}/rate?${buildURLQuery(_.merge(MOCK_RATE_DOMESTIC, { type: 'retail' }))}`,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('array');
  });

  it('get rate (P.O. Box) - [get] /shipping/rate', async () => {
    const res = await axios.get(
      `${BASE_URL}/rate?${buildURLQuery(_.merge(MOCK_RATE_DOMESTIC_POBOX, { type: 'retail' }))}`,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('array');
    expect(data.length).to.be.eq(1);
  });
});
