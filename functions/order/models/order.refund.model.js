import mongoose from 'mongoose';

if (!global.OrderRefundSchema) {
  mongoose.Promise = global.Promise;

  /**
   * OrderRefund schema
   */
  global.OrderRefundSchema = new mongoose.Schema(
    {
      amount: {
        type: Number,
      },
      note: {
        type: String,
      },
      transaction_id: { // a transaction ID from the gateway provider
        type: String,
      },
      refunded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      deleted: { // a logical delete flag
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: {
        createdAt: 'dt_created',
      },
    },
  );
}

module.exports = {
  OrderRefundSchema: global.OrderRefundSchema,
  OrderRefund: mongoose.model('OrderRefund', global.OrderRefundSchema),
};
