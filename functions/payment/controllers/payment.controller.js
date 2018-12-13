import Converge from '../lib/converge';
import { Payment } from '../models/payment.model';

export default class PaymentController {
  /**
   * get the specified transaction status
   */
  static async getStatus(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const payment = await Payment.findOne({
        'payment_gateway_response.transaction_id': req.params.id,
      });
      if (!payment) {
        return res.error('Item with id not found', 404);
      }

      return res.success(payment);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * verify card
   */
  static async verifyCard(paymentData) {
    const converge = new Converge(
      global.env.CONVERGE_ENDPOINT,
      global.env.CONVERGE_MERCHANT_ID,
      global.env.CONVERGE_USER_ID,
      global.env.CONVERGE_PIN,
    );

    try {
      const expiration = paymentData.expiration.split('-');
      const elavonRequested = {
        cardNumber: paymentData.cc_number,
        expirationMonth: expiration[0],
        expirationYear: expiration[1],
        cvv: paymentData.security_code,
        firstName: paymentData.billing.first_name,
        lastName: paymentData.billing.last_name,
        address: paymentData.billing.address_1
          + (paymentData.billing.address_2 ? ` ${paymentData.billing.address_2}` : ''),
        city: paymentData.billing.city || '',
        state: paymentData.billing.state || '',
        zip: paymentData.billing.postal_code,
        country: paymentData.billing.country,
      };
      const response = await converge.verifyCard(elavonRequested);

      // if refund request was declined
      if (parseInt(response.txn.ssl_result, 10) !== 0) {
        throw new Error('Credit Card Verification Failed.');
      }

      return response;
    } catch (err) {
      throw err;
    }
  }

  /**
   * submit a payment
   */
  static async submitPayment(paymentData) {
    const converge = new Converge(
      global.env.CONVERGE_ENDPOINT,
      global.env.CONVERGE_MERCHANT_ID,
      global.env.CONVERGE_USER_ID,
      global.env.CONVERGE_PIN,
    );

    try {
      // process payment via elavon
      const expiration = paymentData.expiration.split('-');
      const elavonRequested = {
        firstName: paymentData.billing.first_name,
        lastName: paymentData.billing.last_name,
        email: paymentData.billing.email,
        cardNumber: paymentData.cc_number,
        expirationMonth: expiration[0],
        expirationYear: expiration[1],
        cvv: paymentData.security_code,
        amount: paymentData.amount,
        invoiceNumber: paymentData.invoice_number,
        customerCode: paymentData.invoice_number,
        cardholderIp: paymentData.cardholder_ip,
        avs: paymentData.avs, // ccverify response object
        company: paymentData.billing.company,
        phone: paymentData.billing.phone,
      };
      const response = await converge.collectPayment(elavonRequested);

      // record the payment request
      const paymentGatewayResponse = {
        transaction_id: response.txn.ssl_txn_id,
        response_code: response.txn.ssl_result_message,
        card_used: response.txn.ssl_card_number,
        dt_created: new Date(),
      };
      const payment = await Payment.create({
        amount: response.txn.ssl_amount,
        billing: paymentData.billing,
        cc_number: paymentData.cc_number.substr(paymentData.cc_number.length - 4), // last 4 digits
        status: parseInt(response.txn.ssl_result, 10) === 0 ? 'paid' : 'failed',
        type: paymentData.type,
        payment_gateway_response: paymentGatewayResponse,
      });

      return payment;
    } catch (err) {
      throw err;
    }
  }

  /**
   * refund the specified transaction
   * to be called by OrderController::refund()
   */
  static async refundPayment({ transactionId, amount }) {
    const converge = new Converge(
      global.env.CONVERGE_ENDPOINT,
      global.env.CONVERGE_MERCHANT_ID,
      global.env.CONVERGE_USER_ID,
      global.env.CONVERGE_PIN,
    );

    try {
      const payment = await Payment.findOne({
        'payment_gateway_response.transaction_id': transactionId,
      });
      if (!payment) {
        throw new Error('Transaction not found');
      }

      // refund transaction via converge api
      const response = await converge.refundPayment({
        transactionId,
        amount,
      });

      // if refund request was declined
      if (parseInt(response.txn.ssl_result, 10) !== 0) {
        return [
          `Elavon Converge Credit Card Refund Failed. ${response.txn.ssl_result_message}`,
          null,
        ];
      }

      // refund was processed
      payment.amount -= parseFloat(response.txn.ssl_amount);
      payment.status = 'refunded';
      await payment.save();

      return [null, response.txn.ssl_txn_id];
    } catch (err) {
      throw err;
    }
  }
}
