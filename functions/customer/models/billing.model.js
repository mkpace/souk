import mongoose from 'mongoose';

if (!global.BillingSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Billing schema
   */
  global.BillingSchema = new mongoose.Schema({
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    company: {
      type: String,
    },
    address_1: { // eg. 2112 SE Timberlane Rd
      type: String,
    },
    address_2: { // eg. Apartment
      type: String,
    },
    city: {
      type: String,
    },
    postal_code: {
      type: String,
    },
    country: { // eg. US
      type: String,
    },
    state: {
      type: String,
    },
    phone: { // eg. 5199857479
      type: String,
    },
    email: { // eg. 1031knox@gmail.com
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: email => !email || /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email),
        message: 'Email is not valid.',
      },
    },
  });
}

module.exports = {
  BillingSchema: global.BillingSchema,
  Billing: mongoose.model('Billing', global.BillingSchema),
};
