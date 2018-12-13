/*
 * mock tax item
 */
const MOCK_TAX = {
  country_code: 'US',
  state: 'NY',
  city: 'Staten Island',
  postal_code: '33312',
  rate: '100',
  tax_name: 'State Tax',
  priority: 1,
  compound: true,
  shipping: true,
};

const UPDATED_MOCK_TAX = {
  country_code: 'US',
  state: 'NY',
  city: 'Staten Island',
  postal_code: '33312',
  rate: '150',
  tax_name: 'State Tax',
  priority: 5,
  compound: true,
  shipping: false,
};

module.exports = {
  MOCK_TAX,
  UPDATED_MOCK_TAX,
};
