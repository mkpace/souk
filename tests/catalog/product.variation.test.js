import axios from 'axios';
import { expect } from 'chai';

import { Product } from '../../functions/catalog/models/product.model';
import { MOCK_PRODUCT } from './mock/product';
import {
  MOCK_PRODUCT_VARIATION,
  UPDATE_MOCK_PRODUCT_VARIATION,
} from './mock/product.variation';

const BASE_URL = 'http://localhost:3000/catalog';

/**
 * tests begin
 */
describe('Catalog API [Variation]', async () => {
  let productId;
  let variationId;

  /**
   * create a test product
   */
  before(async () => {
    await Product.deleteMany({}); // remove all products
    const product = await Product.create(MOCK_PRODUCT);
    productId = product._id;
  });

  /**
   * remove test product (soft delete)
   */
  after(async () => {
    await Product.findByIdAndUpdate(productId, { deleted: true });
  });

  it('create a new product variation - [post] /catalog/:id/variation/?type=wholesale', async () => {
    const res = await axios.post(
      `${BASE_URL}/${productId}/variation/?type=wholesale`,
      MOCK_PRODUCT_VARIATION,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.name).to.eq(MOCK_PRODUCT_VARIATION.name);
    expect(data.slug).to.eq(MOCK_PRODUCT_VARIATION.slug);
    expect(data.sku).to.eq(MOCK_PRODUCT_VARIATION.sku);
    expect(data.stock_qty).to.eq(MOCK_PRODUCT_VARIATION.stock_qty);
    expect(data.price).to.eq(MOCK_PRODUCT_VARIATION.price);
    expect(data.on_sale).to.eq(MOCK_PRODUCT_VARIATION.on_sale);
    expect(data.backordered).to.eq(MOCK_PRODUCT_VARIATION.backordered);
    expect(data.backorders_allowed).to.eq(MOCK_PRODUCT_VARIATION.backorders_allowed);
    expect(data.deleted).to.eq(false);
    expect(data).to.have.property('discount_price');

    expect(data.images).to.be.a('array');
    expect(data.variation_options).to.be.a('array');

    variationId = data._id; /* eslint no-underscore-dangle: 0 */
  });

  it('get the specified product variation - [get] /catalog/:id/variation/:variation_id', async () => {
    const res = await axios.get(`${BASE_URL}/${productId}/variation/${variationId}`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.name).to.eq(MOCK_PRODUCT_VARIATION.name);
    expect(data.slug).to.eq(MOCK_PRODUCT_VARIATION.slug);
    expect(data.sku).to.eq(MOCK_PRODUCT_VARIATION.sku);
    expect(data.stock_qty).to.eq(MOCK_PRODUCT_VARIATION.stock_qty);
    expect(data.price).to.eq(MOCK_PRODUCT_VARIATION.price);
    expect(data.on_sale).to.eq(MOCK_PRODUCT_VARIATION.on_sale);
    expect(data.backordered).to.eq(MOCK_PRODUCT_VARIATION.backordered);
    expect(data.backorders_allowed).to.eq(MOCK_PRODUCT_VARIATION.backorders_allowed);
    expect(data.deleted).to.eq(false);

    expect(data.images).to.be.a('array');
  });

  it('get the list of product variations - [get] /catalog/:id/variation/', async () => {
    const res = await axios.get(`${BASE_URL}/${productId}/variation/`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('array');
  });

  it('update the product variation item - [put] /catalog/:id/variation/:variation_id', async () => {
    const res = await axios.put(
      `${BASE_URL}/${productId}/variation/${variationId}`,
      UPDATE_MOCK_PRODUCT_VARIATION,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.name).to.eq(UPDATE_MOCK_PRODUCT_VARIATION.name);
    expect(data.slug).to.eq(UPDATE_MOCK_PRODUCT_VARIATION.slug);
    expect(data.sku).to.eq(UPDATE_MOCK_PRODUCT_VARIATION.sku);
  });

  it('soft delete product variation - [delete] /catalog/:id/variation/:variation_id', async () => {
    const res = await axios.delete(`${BASE_URL}/${productId}/variation/${variationId}`);

    expect(res.status).to.eq(200);
  });
});
