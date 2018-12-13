import mongoose from 'mongoose';

if (!global.DailyOrderSchema) {
  mongoose.Promise = global.Promise;

  /**
   * DailyOrder schema
   * @constructor DailyOrder
   */
  global.DailyOrderSchema = new mongoose.Schema({
    date: {
      type: Date,
      default: Date.now,
    },
    timestamp: Number,
    products: {},
  }, { collection: 'DailyOrders' });
}

module.exports = {
  DailyOrderSchema: global.DailyOrderSchema,
  DailyOrder: mongoose.model('DailyOrder', global.DailyOrderSchema),
};
