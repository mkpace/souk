import axios from 'axios';
import { expect } from 'chai';

import {
  MOCK_TAX,
  UPDATED_MOCK_TAX,
} from './mock';

const BASE_URL = 'http://localhost:3000/tax';

/*
 * tests begin
 */
describe('Tax API', async () => {
  let taxId;

  it('add tax - [post] /tax', async () => {
    const res = await axios.post(
      `${BASE_URL}`,
      MOCK_TAX,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');
    expect(data.deleted).to.eq(false);

    expect(data.country_code).to.eq(MOCK_TAX.country_code);
    expect(data.state).to.eq(MOCK_TAX.state);
    expect(data.city).to.eq(MOCK_TAX.city);
    expect(data.postal_code).to.eq(MOCK_TAX.postal_code);
    expect(data.rate).to.eq(MOCK_TAX.rate);
    expect(data.tax_name).to.eq(MOCK_TAX.tax_name);
    expect(data.priority).to.eq(MOCK_TAX.priority);
    expect(data.compound).to.eq(MOCK_TAX.compound);
    expect(data.shipping).to.eq(MOCK_TAX.shipping);

    taxId = data._id; /* eslint no-underscore-dangle: 0 */
  });

  it('get the list of all tax items - [get] /tax?city=?', async () => {
    const res = await axios.get(`${BASE_URL}?city=${MOCK_TAX.city}`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('array');
  });

  it('get tax item by id - [get] /tax/:_id', async () => {
    const res = await axios.get(`${BASE_URL}/${taxId}`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data.country_code).to.eq(MOCK_TAX.country_code);
    expect(data.state).to.eq(MOCK_TAX.state);
    expect(data.city).to.eq(MOCK_TAX.city);
    expect(data.postal_code).to.eq(MOCK_TAX.postal_code);
    expect(data.rate).to.eq(MOCK_TAX.rate);
    expect(data.tax_name).to.eq(MOCK_TAX.tax_name);
    expect(data.priority).to.eq(MOCK_TAX.priority);
    expect(data.compound).to.eq(MOCK_TAX.compound);
    expect(data.shipping).to.eq(MOCK_TAX.shipping);
  });

  it('update tax item - [put] /tax/:_id', async () => {
    const res = await axios.put(
      `${BASE_URL}/${taxId}`,
      UPDATED_MOCK_TAX,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');
    expect(data.deleted).to.eq(false);

    expect(data.country_code).to.eq(UPDATED_MOCK_TAX.country_code);
    expect(data.state).to.eq(UPDATED_MOCK_TAX.state);
    expect(data.city).to.eq(UPDATED_MOCK_TAX.city);
    expect(data.postal_code).to.eq(UPDATED_MOCK_TAX.postal_code);
    expect(data.rate).to.eq(UPDATED_MOCK_TAX.rate);
    expect(data.tax_name).to.eq(UPDATED_MOCK_TAX.tax_name);
    expect(data.priority).to.eq(UPDATED_MOCK_TAX.priority);
    expect(data.compound).to.eq(UPDATED_MOCK_TAX.compound);
    expect(data.shipping).to.eq(UPDATED_MOCK_TAX.shipping);
  });

  it('soft delete tax item - [delete] /tax/:_id', async () => {
    const res = await axios.delete(`${BASE_URL}/${taxId}`);

    expect(res.status).to.eq(200);
  });
});
