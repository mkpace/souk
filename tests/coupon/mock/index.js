const MOCK_COUPON = {
  type: 'percentage',
  code: 'DISCOUNT',
  amount: 10,
  allow_free_shipping: false,
  expiry: new Date(2018, 12, 31),
  minimum_spend: 100,
  maximum_spend: 1000,
  individual: true,
  exclude_sales_items: false,
  exclude_products: [],
};

const UPDATED_MOCK_COUPON = {
  amount: 11,
};

module.exports = {
  MOCK_COUPON,
  UPDATED_MOCK_COUPON,
};
