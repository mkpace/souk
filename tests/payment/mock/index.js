/*
 * mock payment for integration test
 */
const MOCK_BILLING_ADDRESS = {
  first_name: 'angie',
  last_name: 'lucas',
  company: 'string',
  address_1: 'staten island',
  address_2: '',
  city: 'newyork',
  state: 'NY',
  postal_code: '10001',
  country: 'US',
  email: 'naritalinn@live.com',
  phone: '5199857479',
  isValid: true,
};

const MOCK_PAYMENT = {
  billing: MOCK_BILLING_ADDRESS,
  cc_number: '4123456789012349',
  type: 'Master Card',
  expiration: '12-19',
  security_code: '123',
  amount: 10.00,
};

module.exports = {
  MOCK_BILLING_ADDRESS,
  MOCK_PAYMENT,
};
