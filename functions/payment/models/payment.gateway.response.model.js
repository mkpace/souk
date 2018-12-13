import mongoose from 'mongoose';

if (!global.PaymentGatewayResponseSchema) {
  mongoose.Promise = global.Promise;

  /**
   * PaymentGatewayResponse schema
   */
  global.PaymentGatewayResponseSchema = new mongoose.Schema(
    {
      transaction_id: {
        dropDups: true,
        required: true,
        type: String,
        unique: true,
      },
      response_code: { // eg. Approved
        type: String,
      },
      card_used: { // only first two and last four are returned
        type: String,
      },
      dt_created: {
        type: Date,
      },
    },
  );
}

module.exports = {
  PaymentGatewayResponseSchema: global.PaymentGatewayResponseSchema,
  PaymentGatewayResponse: mongoose.model('PaymentGatewayResponse', global.PaymentGatewayResponseSchema),
};
