import mongoose from 'mongoose';

import { MethodSchema } from './method.model';

if (!global.ZoneSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Zone schema
   *
   * A shipping zone is a geographic region where a certain set
   * of shipping methods are offered. The Shipping Service Logic will
   * match a customer to a single zone using their shipping address
   * and present the shipping methods within that zone to them
   *
   *
   * @constructor Zone
   */
  global.ZoneSchema = new mongoose.Schema(
    {
      name: {
        type: String,
      },
      regions: [String],
      shipping_methods: [MethodSchema],
    },
  );
}

module.exports = {
  ZoneSchema: global.ZoneSchema,
  Zone: mongoose.model('Zone', global.ZoneSchema),
};
