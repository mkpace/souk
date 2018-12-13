import { MOCK_IMAGE } from './image';

const MOCK_PRODUCT_VARIATION = {
  position: 0,
  name: 'HP Pavilion',
  slug: 'hp-pavilion',
  sku: 'HPP173',
  long_description: 'LONG DESCRIPTION',
  short_description: 'SHORT DESCRIPTION',
  stock_qty: 5,
  price: '40',
  on_sale: true,
  dimensions: {
    height: '30',
    width: '30',
    length: '40',
  },
  weight: 10.5,
  backordered: true,
  backorders_allowed: true,
  images: [
    MOCK_IMAGE,
  ],
  variation_options: [
    {
      name: 'count',
      option: '40',
    },
    {
      name: 'amount',
      option: '225 mg',
    },
  ],
};

const UPDATE_MOCK_PRODUCT_VARIATION = {
  name: 'HP Pavilion - 17.3',
  slug: 'hp-pavilion-17.3',
  sku: 'HPP173',
};

module.exports = {
  MOCK_PRODUCT_VARIATION,
  UPDATE_MOCK_PRODUCT_VARIATION,
};
