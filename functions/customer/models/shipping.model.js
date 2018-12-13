import mongoose from 'mongoose';

if (!global.ShippingSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Shipping schema
   */
  global.ShippingSchema = new mongoose.Schema({
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
    preferred_method: {
      type: String,
      enum: [
        'Ground',
        '3Day',
        '2Day',
        'Overnight',
      ],
      default: 'Ground',
    },
    phone: { // eg. 5199857479
      type: String,
    },
  });
}

module.exports = {
  ShippingSchema: global.ShippingSchema,
  Shipping: mongoose.model('Shipping', global.ShippingSchema),
};
