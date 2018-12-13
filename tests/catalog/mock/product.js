import { MOCK_IMAGE } from './image';

const MOCK_PRODUCT = {
  product_id: 108628,
  name: 'HP Pavilion',
  slug: 'hp-pavilion',
  sku: 'HPP',
  categories: ['Laptop'],
  long_description: 'LONG DESCRIPTION',
  short_description: 'SHORT DESCRIPTION',
  stock_qty: 0,
  price: '0',
  on_sale: true,
  dimensions: {
    height: '30',
    width: '30',
    length: '40',
  },
  weight: 10.5,
  backordered: true,
  backorders_allowed: true,
  images: [MOCK_IMAGE],
  potency_results: [{ url: 'test', title: 'test' }],
  heavy_metals: [{ url: 'test', title: 'test' }],
  pesticides: [],
  variations: [],
  variation_types: [
    {
      name: 'count',
      options: ['40', '100', '200'],
      type: 'swatch',
    },
    {
      name: 'amount',
      options: ['225 mg', '900mg'],
      type: 'dropdown',
    },
  ],
  featured: false,
  status: 'staged',
  type: 'retail',
};

const UPDATE_MOCK_PRODUCT = {
  name: 'HP Pavilion',
  slug: 'hp-pavilion',
};

module.exports = {
  MOCK_PRODUCT,
  UPDATE_MOCK_PRODUCT,
};
