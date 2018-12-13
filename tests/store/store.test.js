import axios from 'axios';
import { expect } from 'chai';

import { Store } from '../../functions/store/models/store.model';
import { MOCK_STORE, UPDATE_MOCK_STORE } from './mock/store';

const BASE_URL = 'http://localhost:3000/store';

describe('Store API', async () => {
  let storeId;

  before(async () => {
    await Store.deleteMany({}); // remove all products
  });

  it('create a new store - [post] /store', async () => {
    const res = await axios.post(BASE_URL, MOCK_STORE);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.name).to.eq(MOCK_STORE.name);

    storeId = data._id; /* eslint no-underscore-dangle: 0 */
  });

  it('update a store - [put] /store/:id', async () => {
    const res = await axios.put(`${BASE_URL}/${storeId}`, UPDATE_MOCK_STORE);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.name).to.eq(UPDATE_MOCK_STORE.name);
  });

  it('soft delete store - [delete] /store/:id', async () => {
    const res = await axios.delete(`${BASE_URL}/${storeId}`);

    expect(res.status).to.eq(200);
  });

  it('get all stores - [get] /catalog', async () => {
    const res = await axios.get(`${BASE_URL}`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('array');
  });
});
