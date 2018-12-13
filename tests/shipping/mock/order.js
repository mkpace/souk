const MOCK_ORDER = {
  orderNumber: '819729387192739',
  orderKey: '819729387192739', // optional
  orderDate: '2018-10-09T08:46:27.0000000',
  paymentDate: '2018-10-09T08:46:27.0000000', // optional
  orderStatus: 'awaiting_shipment',
  customerUsername: 'headhoncho@whitehouse.gov', // optional
  customerEmail: 'headhoncho@whitehouse.gov', // optional
  billTo: {
    name: 'Mark Pace',
    company: 'Souk',
    street1: 'Staten Island',
    street2: null,
    street3: null,
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
    phone: '19033045283',
    residential: null,
    addressVerified: 'Address not yet validated',
  },
  shipTo: {
    name: 'Mark Pace',
    company: 'Souk',
    street1: 'Staten Island',
    street2: null,
    street3: null,
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
    phone: '19033045283',
    residential: null,
    addressVerified: 'Address not yet validated',
  },
  amountPaid: 210.00, // optional, total amount paid
  taxAmount: 0.00, // optional
  shippingAmount: 10.00, // optional
  paymentMethod: 'Credit Card', // optional

  // shipping information
  requestedShippingService: 'Ground Shipping', // optional
  // carrierCode: '',
  serviceCode: 'UPS Ground',
  // packageCode: '',
  weight: { // optional
    value: 10.00,
    units: 'grams',
  },

  items: [
    {
      sku: 'TBHPT',
      name: 'HP Pavilion',
      imageUrl: 'http://www.test.com/',
      weight: {
        value: 10.00,
        units: 'grams',
      },
      quantity: 1,
      unitPrice: 200.00,
      options: [
        {
          name: 'Amount',
          value: '900 mg',
        },
      ],
    },
  ],
};

module.exports = {
  MOCK_ORDER,
};
