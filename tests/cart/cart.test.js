import axios from 'axios';
import { expect } from 'chai';

import { Cart } from '../../functions/cart/models/cart.model';
import { Product } from '../../functions/catalog/models/product.model';
import {
  MOCK_PRODUCT_UPDATED,
  MOCK_ITEM,
  MOCK_CART,
  UPDATED_MOCK_CART,
  DELETE_ITEM_FROM_CART,
} from './mock';

const BASE_URL = 'http://localhost:3000/cart';

/*
 * tests begin
 * it assumes `catalog.test` runs beforehand
 */
describe('Shopping Cart API', async () => {
  let productId;
  let cartId;

  /**
   * create a test product
   */
  before(async () => {
    await Cart.deleteMany({});
    await Product.deleteMany({}); // remove all products
    const product = await Product.create(MOCK_PRODUCT_UPDATED);
    productId = product._id;
  });

  /**
   * remove test product (soft delete)
   */
  after(async () => {
    await Product.findByIdAndUpdate(productId, { deleted: true });
  });

  it('add cart - [post] /cart/user/:user_id', async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/user/${MOCK_CART.user_id}`,
        MOCK_CART,
      );
      const { data } = res;

      expect(res.status).to.eq(200);
      expect(data).to.be.a('object');
      expect(data.user_id).to.eq(MOCK_CART.user_id);
      expect(data.deleted).to.eq(false);

      expect(data.items).to.be.a('array');
      expect(data.items.length).to.be.above(0);
      expect(data.items[0].sku).to.eq(MOCK_ITEM.sku);
      expect(data.items[0].count).to.eq(MOCK_ITEM.count);

      cartId = data._id; /* eslint no-underscore-dangle: 0 */
    } catch (err) {
      console.log(err); // eslint-disable-line
    }
  });

  it('get cart by cart id - [get] /cart/:_id', async () => {
    const res = await axios.get(`${BASE_URL}/${cartId}`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data.items).to.be.a('array');
    expect(data.items.length).to.be.above(0);
    expect(data.items[0].sku).to.eq(MOCK_ITEM.sku);
    expect(data.items[0].count).to.eq(MOCK_ITEM.count);
  });

  it('update cart - [put] /cart/user/:user_id', async () => {
    try {
      await axios.put(
        `${BASE_URL}/user/${MOCK_CART.user_id}`,
        UPDATED_MOCK_CART,
      );
    } catch (err) {
      // `out of stock` error should happen
      expect(err.response.status).to.eq(400);
    }
  });

  it('get cart for the test user - [get] /cart/user/:user_id', async () => {
    const res = await axios.get(`${BASE_URL}/user/${MOCK_CART.user_id}`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');
    expect(data.deleted).to.eq(false);

    expect(data.items).to.be.a('array');
    expect(data.items.length).to.be.above(0);
    expect(data.items[0].sku).to.eq(MOCK_ITEM.sku);
    expect(data.items[0].count).to.eq(MOCK_ITEM.count);
  });

  it('update cart - [put] /cart/user/:user_id', async () => {
    const res = await axios.put(
      `${BASE_URL}/user/${MOCK_CART.user_id}`,
      DELETE_ITEM_FROM_CART,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data.items).to.be.a('array');
    expect(data.items.length).to.eq(0);
  });

  it('soft delete cart - [delete] /cart/user/:user_id', async () => {
    const res = await axios.delete(`${BASE_URL}/user/${MOCK_CART.user_id}`);

    expect(res.status).to.eq(200);
  });

  it('get cart for the test user again, should return 400 (not found)', async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/${MOCK_CART.user_id}`);

      expect(res.status).to.eq(200);
    } catch (e) {
      expect(e.response.status).to.eq(404);
    }
  });
});
