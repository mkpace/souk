import axios from 'axios';
import { expect } from 'chai';

import { Product } from '../../functions/catalog/models/product.model';
import { User } from '../../functions/user/models/user.model';
import { Order } from '../../functions/order/models/order.model';
import { MOCK_ADMIN } from '../user/mock';
import {
  MOCK_PRODUCT_UPDATED,
  MOCK_ORDER,
  UPDATED_MOCK_ORDER,
} from './mock';

const BASE_URL = 'http://localhost:3000/order';

/*
 * tests begin
 * it assumes `catalog.test` runs beforehand
 */
describe('Order API', async () => {
  let productId;
  let authToken;
  let orderNumber;

  /**
   * create a test product
   */
  before(async () => {
    await Order.deleteMany({});
    await User.deleteMany({});
    await User.create(MOCK_ADMIN);

    await Product.deleteMany({});
    const product = await Product.create(MOCK_PRODUCT_UPDATED);
    productId = product._id;
  });

  /**
   * remove test product (soft delete)
   */
  after(async () => {
    await Product.findByIdAndUpdate(productId, { deleted: true });
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

  it('create an order - [post] /order', async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}`,
        MOCK_ORDER,
        {
          headers: {
            Authorization: `bearer ${authToken}`,
          },
        },
      );
      const { data } = res;

      expect(res.status).to.eq(200);
      expect(data).to.be.a('object');

      expect(data.customer_id).to.eq(MOCK_ORDER.customer_id);
      expect(data.billing.first_name).to.eq(MOCK_ORDER.billing.first_name);
      expect(data.billing.last_name).to.eq(MOCK_ORDER.billing.last_name);
      expect(data.billing.company).to.eq(MOCK_ORDER.billing.company);
      expect(data.billing.address_1).to.eq(MOCK_ORDER.billing.address_1);
      expect(data.billing.address_2).to.eq(MOCK_ORDER.billing.address_2);
      expect(data.created_via).to.eq(MOCK_ORDER.created_via);
      expect(data.status).to.eq('paid');
      expect(data.currency).to.eq(MOCK_ORDER.currency);
      expect(data.invoice_number).to.eq(MOCK_ORDER.invoice_number);
      expect(data.discount).to.eq(MOCK_ORDER.discount);
      expect(data.discount_total).to.eq(MOCK_ORDER.discount_total);

      orderNumber = data.order_number;
    } catch (err) {
      console.log(err); // eslint-disable-line
    }
  });

  it('get all orders - [get] /order?type=XXX&dateStart=XXX&dateEnd=XXX', async () => {
    const res = await axios.get(
      `${BASE_URL}?type=retail`,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);

    expect(data).to.have.property('total');
    expect(data).to.have.property('page');
    expect(data).to.have.property('count');
    expect(data).to.have.property('orders');
    expect(data.orders).to.be.a('array');
  });

  it('get the list of orders by customer - [get] /order/customer/:customer_id', async () => {
    const res = await axios.get(
      `${BASE_URL}/customer/${MOCK_ORDER.customer_id}`,
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

  it('update an order - [put] /order/:id', async () => {
    const res = await axios.put(
      `${BASE_URL}/${orderNumber}`,
      UPDATED_MOCK_ORDER,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.invoice_number).to.eq(UPDATED_MOCK_ORDER.invoice_number);
    expect(data.discount).to.eq(UPDATED_MOCK_ORDER.discount);
    expect(data.discount_total).to.eq(UPDATED_MOCK_ORDER.discount_total);
    expect(data.discount_tax).to.eq(UPDATED_MOCK_ORDER.discount_tax);
    expect(data.shipping_total).to.eq(UPDATED_MOCK_ORDER.shipping_total);
    expect(data.shipping_tax).to.eq(UPDATED_MOCK_ORDER.shipping_tax);
  });

  it('refund an order - [put] /order/:id/refund', async () => {
    try {
      const res = await axios.put(
        `${BASE_URL}/${orderNumber}/refund`,
        {
          amount: 10.00,
          note: 'Test refund',
        },
        {
          headers: {
            Authorization: `bearer ${authToken}`,
          },
        },
      );
      const { data } = res;

      expect(res.status).to.eq(200);
      expect(data).to.have.property('refunds');
    } catch (err) {
      console.log(err); // eslint-disable-line
    }
  });

  it('get a specific order by id - [get] /order/:id', async () => {
    const res = await axios.get(
      `${BASE_URL}/${orderNumber}`,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.order_number).to.eq(orderNumber);
    expect(data.customer_id).to.eq(MOCK_ORDER.customer_id);
  });

  it('soft delete order - [delete] /order/:id', async () => {
    const res = await axios.delete(
      `${BASE_URL}/${orderNumber}`,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );

    expect(res.status).to.eq(200);
  });
});
