const MOCK_SETTING = {
  key: 'cart-purchase-remind',
  value: '5',
  description: 'Cron sweep job to select the carts that are the specific days old based on last updated timestamp',
};

const UPDATED_MOCK_SETTING = {
  additional_options: {
    valueInNumber: 5,
  },
};

module.exports = {
  MOCK_SETTING,
  UPDATED_MOCK_SETTING,
};
