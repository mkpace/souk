import { MOCK_USER } from '../../user/mock';

const MOCK_PRODUCT_ID = '5bca9042236a9616de853904';

const MOCK_COMMENT = {
  rating: 4.5,
  comment: 'This is mock comment.',
  status: 'pending',
  ip: '10.248.19.201',
};

const UPDATED_MOCK_COMMENT = {
  rating: 5.0,
  status: 'spam',
};

module.exports = {
  MOCK_USER,
  MOCK_PRODUCT_ID,
  MOCK_COMMENT,
  UPDATED_MOCK_COMMENT,
};
