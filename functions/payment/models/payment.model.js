import mongoose from 'mongoose';

import { BillingSchema } from '../../customer/models/billing.model';
import { PaymentGatewayResponseSchema } from './payment.gateway.response.model';

if (!global.PaymentSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Payment schema
   */
  global.PaymentSchema = new mongoose.Schema(
    {
      amount: {
        type: Number,
        default: 0,
      },
      billing: {
        type: BillingSchema,
      },
      cc_number: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ['paid', 'failed', 'refunded'],
      },
      type: {
        type: String,
        enum: ['Master Card', 'Discover', 'American Express', 'Visa'],
        default: 'Master Card',
      },
      payment_gateway_response: {
        type: PaymentGatewayResponseSchema,
      },
    },
  );
}

module.exports = {
  PaymentSchema: global.PaymentSchema,
  Payment: mongoose.model('Payment', global.PaymentSchema),
};
