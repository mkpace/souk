import axios from 'axios';
import fs from 'fs';
import { expect } from 'chai';

import { Product } from '../../functions/catalog/models/product.model';
import {
  MOCK_PRODUCT,
  UPDATE_MOCK_PRODUCT,
} from './mock/product';

const BASE_URL = 'http://localhost:3000/catalog';

function base64Encode(image) {
  // read binary data
  const thumbnail = fs.readFileSync(image);

  // convert binary data to base64 encoded string
  return Buffer.from(thumbnail).toString('base64');
}

describe('Catalog API', async () => {
  let productId;

  before(async () => {
    await Product.deleteMany({}); // remove all products
  });

  it('upload thumbnail - [post] /catalog/thumbnail', async () => {
    const mockImage = base64Encode('./tests/catalog/mock/thumbnail.png');
    const res = await axios.post(
      `${BASE_URL}/thumbnail`,
      { thumbnail: mockImage },
    );
    expect(res.status).to.eq(200);
  });

  it('create a new product - [post] /catalog?type=wholesale', async () => {
    const res = await axios.post(
      BASE_URL,
      MOCK_PRODUCT,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.product_id).to.eq(MOCK_PRODUCT.product_id);
    expect(data.name).to.eq(MOCK_PRODUCT.name);
    expect(data.slug).to.eq(MOCK_PRODUCT.slug);
    expect(data.sku).to.eq(MOCK_PRODUCT.sku);
    expect(data.stock_qty).to.eq(MOCK_PRODUCT.stock_qty);
    expect(data.price).to.eq(MOCK_PRODUCT.price);
    expect(data.on_sale).to.eq(MOCK_PRODUCT.on_sale);
    expect(data.backordered).to.eq(MOCK_PRODUCT.backordered);
    expect(data.backorders_allowed).to.eq(MOCK_PRODUCT.backorders_allowed);
    expect(data.deleted).to.eq(false);

    expect(data.images).to.be.a('array');
    expect(data.variations).to.be.a('array');
    expect(data.variation_types).to.be.a('array');

    productId = data._id; /* eslint no-underscore-dangle: 0 */
  });

  it('create a new product with duplicate sku - [post] /catalog', async () => {
    try {
      await axios.post(
        BASE_URL,
        MOCK_PRODUCT,
      );
    } catch (e) {
      // duplicate sku
      expect(e.response.status).to.eq(400);
      expect(e.response.data.error).to.have.string(`Duplicate SKU: ${MOCK_PRODUCT.sku}`);
    }
  });

  it('get a product item - [get] /catalog/:id?type=wholesale', async () => {
    const res = await axios.get(
      `${BASE_URL}/${productId}?type=wholesale`,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.product_id).to.eq(MOCK_PRODUCT.product_id);
    expect(data.name).to.eq(MOCK_PRODUCT.name);
    expect(data.slug).to.eq(MOCK_PRODUCT.slug);
    expect(data.sku).to.eq(MOCK_PRODUCT.sku);
    expect(data.stock_qty).to.eq(MOCK_PRODUCT.stock_qty);
    expect(data.price).to.eq(MOCK_PRODUCT.price);
    expect(data.on_sale).to.eq(MOCK_PRODUCT.on_sale);
    expect(data.backordered).to.eq(MOCK_PRODUCT.backordered);
    expect(data.backorders_allowed).to.eq(MOCK_PRODUCT.backorders_allowed);
    expect(data.deleted).to.eq(false);
    expect(data).to.have.property('discount_price');

    expect(data.images).to.be.a('array');
    expect(data.variations).to.be.a('array');
  });

  it('update a product - [put] /catalog/:id', async () => {
    const res = await axios.put(
      `${BASE_URL}/${productId}`,
      UPDATE_MOCK_PRODUCT,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.name).to.eq(UPDATE_MOCK_PRODUCT.name);
    expect(data.slug).to.eq(UPDATE_MOCK_PRODUCT.slug);
  });

  it('soft delete product - [delete] /catalog/:id', async () => {
    const res = await axios.delete(
      `${BASE_URL}/${productId}`,
    );

    expect(res.status).to.eq(200);
  });

  it('get all products - [get] /catalog?type=wholesale', async () => {
    const res = await axios.get(
      `${BASE_URL}?type=wholesale&sort=order_index`,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('array');
  });
});
