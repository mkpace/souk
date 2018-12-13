import { MOCK_PRODUCT } from '../../catalog/mock/product';
import { MOCK_PRODUCT_VARIATION } from '../../catalog/mock/product.variation';

const MOCK_PRODUCT_UPDATED = Object.assign(
  {},
  MOCK_PRODUCT,
  { variations: [MOCK_PRODUCT_VARIATION] },
);

const MOCK_ITEM = {
  sku: MOCK_PRODUCT_VARIATION.sku,
  count: 1,
};

const MOCK_CART = {
  user_id: '5b97223770e6515d076a801c',
  items: [
    MOCK_ITEM,
  ],
};

const UPDATED_MOCK_ITEM = {
  sku: MOCK_PRODUCT_VARIATION.sku,
  count: MOCK_PRODUCT_VARIATION.stock_qty + 1, // out of stock
};

const UPDATED_MOCK_CART = {
  items: [
    UPDATED_MOCK_ITEM,
  ],
};

const DELETE_ITEM_FROM_CART = {
  items: [],
};

module.exports = {
  MOCK_PRODUCT_UPDATED,
  MOCK_ITEM,
  MOCK_CART,
  UPDATED_MOCK_ITEM,
  UPDATED_MOCK_CART,
  DELETE_ITEM_FROM_CART,
};
