import axios from 'axios';
import { expect } from 'chai';

const BASE_URL = 'http://localhost:3000/daily-orders';

/*
 * tests begin
 */
describe('DailyOrders API', async () => {
  it('get the list of daily orders - [get] /daily-orders', async () => {
    const res = await axios.get(`${BASE_URL}`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('array');
  });
});
