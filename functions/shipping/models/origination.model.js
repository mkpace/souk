import mongoose from 'mongoose';

if (!global.OriginationSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Origination schema - The originiating shipping location
   *
   * This will change as shipping operations are moved from Seattle to Portland
   *
   * @constructor Origination
   */
  global.OriginationSchema = new mongoose.Schema(
    {
      address_1: {
        type: String,
      },
      address_2: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      country: {
        type: String,
      },
      postalcode: {
        type: String,
      },
    },
  );
}

module.exports = {
  OriginationSchema: global.OriginationSchema,
  Origination: mongoose.model('Origination', global.OriginationSchema),
};
