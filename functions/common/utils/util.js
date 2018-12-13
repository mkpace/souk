const moneyFormat = val => (val && !Number.isNaN(val)
  ? Math.round(parseFloat(val) * 100) / 100
  : 0.00
);

module.exports = {
  moneyFormat,
};
