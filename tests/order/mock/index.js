import { MOCK_PRODUCT } from '../../catalog/mock/product';
import { MOCK_PRODUCT_VARIATION } from '../../catalog/mock/product.variation';
import { MOCK_PAYMENT } from '../../payment/mock';

const MOCK_PRODUCT_UPDATED = Object.assign(
  {},
  MOCK_PRODUCT,
  { variations: [MOCK_PRODUCT_VARIATION] },
);

const MOCK_ORDER = {
  customer_id: '5b97223770e6515d076a801d',
  billing: {
    first_name: 'Cheryl',
    last_name: 'Knox',
    company: 'Wholesaler',
    address_1: '11703 Huebner Rd',
    address_2: 'STE 106-472',
    city: 'San Antonio',
    postal_code: '78230',
    country: 'US',
    state: 'TX',
    phone: '6156931954',
    email: '1031knox@gmail.com',
  },
  shipping: {
    first_name: 'Cheryl',
    last_name: 'Knox',
    company: 'Wholesaler',
    address_1: '11703 Huebner Rd',
    address_2: 'STE 106-472',
    city: 'San Antonio',
    postal_code: '78230',
    country: 'US',
    state: 'TX',
    preferred_method: 'Ground',
    phone: '6156931954',
  },
  created_via: 'checkout',
  currency: 'USD',
  dt_created: '2018-08-20T10:00:02',
  dt_updated: '2018-08-20T10:00:02',
  invoice_number: 2230,
  discount: 0,
  discount_total: 0,
  discount_tax: 0,
  shipping_total: 7.12,
  shipping_tax: 0.46,
  po_number: 'MG2018',
  type: 'retail',
  terms: '5% upfront / 50% net 30',
  rep: 'BW Brad Worthington',
  ship_via: 'Customer P/U',
  fob: 'Seattle',
  ship_date: '2018-04-18',
  total: 407.71,
  total_tax: 0.46,
  total_shipping: 0.46,
  prices_include_tax: false,
  payment_method: 'credit-card',
  dt_paid: '2018-09-04T15:15:12.832Z',
  dt_completed: '2018-09-04T15:15:12.832Z',
  items: [
    {
      sku: MOCK_PRODUCT_VARIATION.sku,
      count: 1,
    },
  ],
  weight: 5.0,
  paymentData: MOCK_PAYMENT,
};

const UPDATED_MOCK_ORDER = {
  invoice_number: 2232,
  discount: 1,
  discount_total: 1,
  discount_tax: 10,
  shipping_total: 7.25,
  shipping_tax: 5.09,
};

module.exports = {
  MOCK_PRODUCT_UPDATED,
  MOCK_ORDER,
  UPDATED_MOCK_ORDER,
};
