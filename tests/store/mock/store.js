const MOCK_STORE = {
  name: 'Sample Store',
  description: 'Sample Store',
  address_1: 'Address 1',
  city: 'Newport',
  state: 'VT',
  postal_code: '05855',
  country: 'US',
  open_hour: [
    {
      day: 'Monday',
      open: new Date(0, 0, 0, 9),
      close: new Date(0, 0, 0, 17),
    },
  ],
  tel: '',
  fax: '',
  email: '',
  url: '',
};
const UPDATE_MOCK_STORE = {
  name: 'NEW STORE',
};
module.exports = {
  MOCK_STORE,
  UPDATE_MOCK_STORE,
};
