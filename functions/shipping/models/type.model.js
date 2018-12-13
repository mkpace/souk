import mongoose from 'mongoose';

if (!global.TypeSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Type schema
   *
   * A shipping type maps a specified strategy to the zone and order type
   * Shipping types are plug-in strategies which calculate shipping costs
   * based on zone and order amount. Need to support default strategies for Flat Rate,
   * Free Shipping, Local Pickup, Small Package (Parcel), and USPS
   *
   *
   * @constructor Type
   */
  global.TypeSchema = new mongoose.Schema(
    {
      name: {
        type: String,
      },
      description: {
        type: String,
      },
      strategy: {
        type: String,
      },
    },
  );
}

module.exports = {
  TypeSchema: global.TypeSchema,
  Type: mongoose.model('Type', global.TypeSchema),
};
