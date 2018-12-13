import mongoose from 'mongoose';

if (!global.TaxSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Tax schema, representing an individual tax record
   * @constructor Tax
   */
  global.TaxSchema = new mongoose.Schema(
    {
      country_code: {
        type: String,
      },
      state: {
        type: String,
      },
      city: {
        type: String,
      },
      postal_code: {
        type: String,
      },
      rate: { // The percentage tax
        type: String,
      },
      tax_name: { // A description of the tax
        type: String,
      },
      priority: {
        type: Number,
        default: 0,
      },
      compound: { // Compound tax rates are applied on top of other tax rates
        type: Boolean,
        default: false,
      },
      shipping: { // Tax rate is also applied to shipping
        type: Boolean,
        default: false,
      },
      deleted: { // A logical delete flag for the cart
        type: Boolean,
        default: false,
      },
    },
  );
}

module.exports = {
  Tax: mongoose.model('Tax', global.TaxSchema),
};
