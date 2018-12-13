import axios from 'axios';
import { expect } from 'chai';

import {
  MOCK_COUNTRY,
  UPDATED_MOCK_COUNTRY,
} from './mock';

const BASE_URL = 'http://localhost:3000/country';

/*
 * tests begin
 */
describe('Country CRUD API', async () => {
  let countryId;

  it('add a country - [post] /country', async () => {
    const res = await axios.post(
      `${BASE_URL}`,
      MOCK_COUNTRY,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.code).to.eq(MOCK_COUNTRY.code);
    expect(data.name).to.eq(MOCK_COUNTRY.name);
    expect(data.deleted).to.eq(false);

    countryId = data._id; /* eslint no-underscore-dangle: 0 */
  });

  it('get the list of countries - [get] /country', async () => {
    const res = await axios.get(`${BASE_URL}`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('array');
  });

  it('update a country item - [put] /country/:id', async () => {
    const res = await axios.put(
      `${BASE_URL}/${countryId}`,
      UPDATED_MOCK_COUNTRY,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.code).to.eq(UPDATED_MOCK_COUNTRY.code);
    expect(data.deleted).to.eq(false);
  });

  it('soft delete a country item - [delete] /country/:id', async () => {
    const res = await axios.delete(`${BASE_URL}/${countryId}`);

    expect(res.status).to.eq(200);
  });
});
