const MOCK_USER = {
  first_name: 'angie',
  last_name: 'lucas',
  username: `angie.lucas${Date.now()}`,
  email: `angie.lucas${Date.now()}@gmail.com`,
  password: 'test',
  roles: ['customer'],
  pin: '1234',
  status: 'approved',
};

module.exports = {
  MOCK_USER,
};
