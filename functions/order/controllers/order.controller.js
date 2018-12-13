import _ from 'lodash';
import moment from 'moment';

import CartController from '../../cart/controllers/cart.controller';
import EmailController from '../../email/controllers/email.controller';
import ItemProductController from '../../cart/controllers/item.product.controller';
import PaymentController from '../../payment/controllers/payment.controller';
import ShippingController from '../../shipping/controllers/shipping.controller';
import OrderEmailController from './order.email.controller';

import { Customer } from '../../customer/models/customer.model';
import { Order } from '../models/order.model';
import { POPULATE_FIELDS } from '../../user/models/user.model';
import logger from '../../common/utils/logger';
import timeoutPromise from '../../common/utils/timeout-promise';

// keeps last "order_number"
// shared between different contexts for the "order" lambda call
let sharedOrderNumber = -1;

// timeout handling for converge api
const MAX_PAYMENT_TIMEOUT = 240000;
const CONNECTION_TIMEOUT_MESSAGE = 'Connection timeout attempting to receive a response from Elavon. '
  + `The response time exceeded ${MAX_PAYMENT_TIMEOUT} milliseconds. `
  + 'This transaction failed.';

export default class OrderController {
  /**
   * generate unique "order_number"
   */
  static async _generateOrderIndex() {
    if (sharedOrderNumber > 0) {
      sharedOrderNumber += 1;
      return sharedOrderNumber;
    }

    try {
      const lastOrder = await Order
        .find({ deleted: false })
        .limit(1)
        .sort({ order_number: -1 })
        .exec();

      if (lastOrder.length === 0) {
        sharedOrderNumber = 300000;
      } else {
        sharedOrderNumber = parseInt(lastOrder[0].order_number, 10) + 1;
      }

      return sharedOrderNumber;
    } catch (err) {
      throw err;
    }
  }

  /**
   * return an array of all orders
   * supports pagination, filtering, sorting
   */
  static async list(req, res) {
    try {
      const filter = {
        dt_created: {
          $gte: new Date('1900-01-01T00:00:00'),
        },
        deleted: false,
      };
      let sort = 'dt_created';

      if (req.query.sort) {
        ({ sort } = req.query);
      }
      if (req.query.type) {
        filter.type = req.query.type.toLowerCase();
      }
      if (req.query.dateStart) {
        filter.dt_created.$gte = new Date(req.query.dateStart);
      }
      if (req.query.dateEnd) {
        filter.dt_created.$lte = new Date(req.query.dateEnd);
      }
      if (req.query.q) {
        filter.order_number = new RegExp(req.query.q, 'i');
      }

      // calculate total numbers
      const total = await Order
        .countDocuments(filter);

      // pagination configuration
      const pageOptions = {
        page: parseInt(req.query.page || 0, 10),
        count: parseInt(req.query.count, 10) === -1 ? total : parseInt(req.query.count || 10, 10),
      };

      const orders = await Order
        .find(filter)
        .sort(sort)
        .skip(pageOptions.page * pageOptions.count)
        .limit(pageOptions.count)
        .populate({
          path: 'customer_id',
          populate: {
            path: 'user',
            model: 'User',
            select: POPULATE_FIELDS,
          },
        })
        .exec();

      // attach products to each order
      const ordersArray = _.map(orders, order => order.toObject());
      await ItemProductController._addProductsForOrders(ordersArray);

      return res.success({
        total,
        page: pageOptions.page,
        count: pageOptions.count,
        orders: ordersArray,
      });
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * exports the list of orders between some date range
   */
  static async export(req, res) {
    try {
      const filter = {
        dt_created: {
          $gte: new Date('1900-01-01T00:00:00'),
        },
        deleted: false,
      };
      if (req.query.dateStart) {
        filter.dt_created.$gte = new Date(req.query.dateStart);
      }
      if (req.query.dateEnd) {
        filter.dt_created.$lte = new Date(req.query.dateEnd);
      }

      const orders = await Order
        .find(filter)
        .exec();

      return res.success(orders);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * get the specified order
   */
  static async orderById(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const order = await Order.findOne({
        order_number: req.params.id,
        deleted: false,
      });
      if (!order) {
        return res.error('Order with id not found', 404);
      }

      return res.item_with_products(order);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * update the specified order
   */
  static async update(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const order = await Order.findOne({
        order_number: req.params.id,
        deleted: false,
      });
      if (!order) {
        return res.error('Order with id not found', 404);
      }

      delete req.body._id; // eslint-disable-line no-underscore-dangle
      const updated = _.assign(order, req.body);
      await updated.save();

      return res.item_with_products(updated);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async updateNotes(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const order = await Order.findOne({
        order_number: req.params.id,
        deleted: false,
      });
      if (!order) {
        return res.error('Order with id not found', 404);
      }

      const updated = _.assign(order, {
        notes: req.body.notes,
      });
      await updated.save();

      return res.success({ notes: updated.notes });
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async destroy(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const order = await Order.findOne({
        order_number: req.params.id,
        deleted: false,
      });
      if (!order) {
        return res.error('Order with id not found', 404);
      }

      order.deleted = true;
      await order.save();

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async ordersByCustomer(req, res) {
    if (!req.params.customer_id) {
      return res.error('Invalid id supplied');
    }

    try {
      const orders = await Order.find({
        customer_id: req.params.customer_id,
        deleted: false,
      });

      return res.item_with_products(orders);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * send notification on order creation
   */
  static async _sendOrderSuccessNotification(order) {
    try {
      const customer = await Customer
        .findOne({
          _id: order.customer_id,
          deleted: false,
        })
        .populate('user');

      if (customer) {
        await EmailController.processEmail(
          `Souk New Order [#${order.order_number}]`,
          'order-received',
          {
            name: `${customer.user.first_name} ${customer.user.last_name}`,
            url: `${global.env.FRONT_BASE_URL}/my-account/view-order/${order.order_number}`,
          },
          [customer.user.email],
        );
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * Create a new order
   */
  static async create(req, res) {
    let order;
    let avsRes = null;
    let payment = null;

    // step 1: validation check
    try {
      if (!req.body.paymentData) {
        return res.error('Payment information is missing.');
      }

      const invalid = await CartController._checkProductsAvailInStock({
        items: req.body.items,
      });
      if (invalid !== '') {
        return res.error(`Item '${invalid}' is not sufficient in stock`);
      }
    } catch (err) {
      return res.error(err.message);
    }

    // step 2: confirm billing & shipping addresses
    try {
      if (req.body.billing.country === 'US') {
        await ShippingController.validateAddress(req.body.billing);
      }
      if (req.body.shipping.country === 'US') {
        await ShippingController.validateAddress(req.body.shipping);
      }
    } catch (err) {
      return res.error('Invalid address.');
    }

    // step 3: verify credit card account
    try {
      avsRes = await timeoutPromise(
        MAX_PAYMENT_TIMEOUT,
        PaymentController.verifyCard(req.body.paymentData),
      );
    } catch (err) {
      return res.error(err.message);
    }

    // step 4: create an order record
    try {
      if (!req.body.order_number) {
        req.body.order_number = `${(await OrderController._generateOrderIndex())}`;
      }
      req.body.status = 'pending';
      order = await Order.create(req.body);
    } catch (err) {
      logger.error(`OrderController: CreateOrder: ${err.message}`);
      return res.error(err.message);
    }

    // step 5: submit payment for processing via elavon api
    // if timeout happens, "payment" is set to null
    try {
      req.body.paymentData.amount = req.body.total;
      req.body.paymentData.avs = avsRes.txn;
      req.body.paymentData.invoice_number = req.body.order_number;
      req.body.paymentData.cardholder_ip = req.body.ip;

      payment = await timeoutPromise(
        MAX_PAYMENT_TIMEOUT,
        PaymentController.submitPayment(req.body.paymentData),
      );
      logger.info('OrderController: CreateOrder: Payment submitted. Transaction ID. '
        + `${payment.payment_gateway_response.transaction_id}`);
    } catch (err) {
      if (err.message.indexOf('Timed out in ') < 0) {
        // unexpected error happens, we remove the order record
        await order.remove();
        return res.error(err.message);
      }
    }

    // step 6: update order based on converge result
    try {
      if (!payment) {
        // timeout handling
        order.status = 'failed';
        order.notes.push({
          message: CONNECTION_TIMEOUT_MESSAGE,
          type: 'private',
        });
        await order.save();
        throw new Error('Timeout for processing payment.');
      }

      order.transaction_id = payment.payment_gateway_response.transaction_id;
      order.status = payment.status === 'paid' ? 'paid' : 'failed';
      order.notes.push({
        message: `Elavon Converge Credit Card Charge ${payment.payment_gateway_response.response_code}: `
          + `${payment.type} ending in ${payment.cc_number} (expires `
          + `${req.body.paymentData.expiration.replace('-', '/')}) `
          + `(Transaction ID ${payment.payment_gateway_response.transaction_id})`,
        type: 'private',
      });
      await order.save();
      await OrderController._sendOrderSuccessNotification(order);

      return res.success(order);
    } catch (err) {
      logger.error(`OrderController: Order update failed. ${err.message}`);
      return res.error(err.message);
    }
  }

  /**
   * send notification on order refund
   */
  static async _sendRefundNotification(order) {
    try {
      const customer = await Customer
        .findOne({
          _id: order.customer_id,
          deleted: false,
        })
        .populate('user');

      if (customer) {
        await EmailController.processEmail(
          `Your Souk Partially Refunded Order #${order.order_number}`,
          'order-partial-refund',
          {
            name: `${customer.user.first_name} ${customer.user.last_name}`,
            order_number: order.order_number,
            order_date: moment(order.dt_created).format('MMMM DD, YYYY'),
            order_info: OrderEmailController.refundOrderInfo(order),
            billing_address: OrderEmailController.billingInfo(order),
          },
          [customer.user.email],
        );
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * refund the specific order
   *
   * req.body format
   * {
   *    refunded_by: 'XXXXXXXXXXXXX',
   *    amount: 10.00,
   *    note: 'XXX',
   * }
   *
   */
  static async refund(req, res) {
    let order;
    let refundTxnId = null;
    let errorLog = null;

    // step 1: find order
    try {
      if (!req.params.id) {
        return res.error('Invalid order id supplied');
      }
      order = await Order.findOne({
        order_number: req.params.id,
        deleted: false,
      });
      if (!order) {
        return res.error('Order with id not found', 404);
      }
    } catch (err) {
      return res.error(err.message);
    }

    // step 2: process refund via elavon
    try {
      [errorLog, refundTxnId] = await timeoutPromise(
        MAX_PAYMENT_TIMEOUT,
        PaymentController.refundPayment({
          transactionId: order.transaction_id,
          amount: parseFloat(req.body.amount),
        }),
      );
    } catch (err) {
      if (err.message.indexOf('Timed out in ') > -1) {
        errorLog = CONNECTION_TIMEOUT_MESSAGE;
      } else {
        errorLog = `Unexpected error: ${err.message}`;
      }
    }

    // step 3: update order
    try {
      if (errorLog) {
        order.notes.push({
          message: errorLog,
          type: 'private',
        });
        await order.save();
        throw new Error(errorLog);
      }

      // refund got processed successfully
      order.status = 'refunded';
      order.refunds.push(
        _.assign(
          req.body,
          { transaction_id: refundTxnId },
        ),
      );
      await order.save();
      await OrderController._sendRefundNotification(order);

      return res.success(order);
    } catch (err) {
      return res.error(err.message);
    }
  }
}
