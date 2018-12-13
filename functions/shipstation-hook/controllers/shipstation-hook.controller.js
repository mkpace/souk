import moment from 'moment';
import _ from 'lodash';

import ItemProductController from '../../cart/controllers/item.product.controller';
import { Customer } from '../../customer/models/customer.model';
import { Order } from '../../order/models/order.model';
import EmailController from '../../email/controllers/email.controller';
import { moneyFormat } from '../../common/utils/util';

const findMatchingSkuItem = (product, sku) => {
  if (product.sku === sku) {
    return product;
  }

  return _.find(product.variations, { sku });
};
const encapsulateText = val => `<![CDATA[${val || ''}]]>`;

export default class ShipstationHookController {
  /**
   * send email notification when order is shipped
   */
  static async _sendOrderShippedNotification(order) {
    try {
      const customer = await Customer
        .findOne({
          _id: order.customer_id,
          deleted: false,
        })
        .populate('user');

      if (customer) {
        await EmailController.processEmail(
          `Your Souk Order [#${order.order_number}] is now complete`,
          'order-shipped-email',
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

  static _isParamValid(params) {
    let isQueryParamValid = true;

    const REQUIRED_QUERY_PARAMS = [
      'action',
      'start_date',
      'end_date',
      'page',
    ];

    _.each(REQUIRED_QUERY_PARAMS, (elem) => {
      if (typeof params[elem] === 'undefined') {
        isQueryParamValid = false;
        return false;
      }
    });

    return isQueryParamValid;
  }

  static async _buildExportXML(orders, pages) {
    const ORDER_STATUS_TO_SS_MAPPING = {
      pending: 'unpaid',
      failed: 'unpaid',
      paid: 'paid',
      shipped: 'shipped',
      refunded: 'unpaid',
      cancelled: 'cancelled',
      'on-hold': 'on-hold',
    };

    let resultXML = '<?xml version="1.0" encoding="utf-8"?>'
      + `<Orders pages="${pages}">`;

    // fill orders with products
    const cloneOrders = _.map(orders, order => order.toObject());
    await ItemProductController._addProductsForOrders(cloneOrders);

    _.each(cloneOrders, (order) => {
      let itemsXML = '';
      _.each(order.items, (item) => {
        if (!item.product) {
          return;
        }

        const matched = findMatchingSkuItem(item.product, item.sku);
        if (!matched) {
          return;
        }
        const unitPrice = order.discount_total > 0
          ? matched.discount_price
          : matched.price;

        itemsXML += '<Item>'
            + `<SKU>${encapsulateText(matched.sku)}</SKU>`
            + `<Name>${encapsulateText(matched.name)}</Name>`
            + `<ImageUrl>${encapsulateText(matched.images[0] ? matched.images[0].src : '')}</ImageUrl>`
            + `<Weight>${encapsulateText(matched.weight)}</Weight>`
            + '<WeightUnits>Grams</WeightUnits>'
            + `<Quantity>${item.count}</Quantity>`
            + `<UnitPrice>${moneyFormat(unitPrice)}</UnitPrice>`;
        if (matched.variation_options) {
          itemsXML += '<Options>';
          _.each(matched.variation_options, (val) => {
            itemsXML += '<Option>'
                + `<Name>${encapsulateText(val.name)}</Name>`
                + `<Value>${encapsulateText(val.option)}</Value>`
              + '</Option>';
          });
          itemsXML += '</Options>';
        }
        itemsXML += '</Item>';
      });

      resultXML += '<Order>'
          + `<OrderID>${encapsulateText(order._id)}</OrderID>`
          + `<OrderNumber>${encapsulateText(order.order_number)}</OrderNumber>`
          + `<OrderDate>${moment(order.dt_created).format('M/D/YYYY HH:mm A')}</OrderDate>`
          + `<OrderStatus>${encapsulateText(ORDER_STATUS_TO_SS_MAPPING[order.status])}</OrderStatus>`
          + `<LastModified>${moment(order.dt_updated).format('M/D/YYYY HH:mm A')}</LastModified>`
          + `<ShippingMethod>${encapsulateText(order.ship_via)}</ShippingMethod>`
          + `<PaymentMethod>${encapsulateText(order.payment_method)}</PaymentMethod>`
          + `<OrderTotal>${moneyFormat(order.total)}</OrderTotal>`
          + `<TaxAmount>${moneyFormat(order.total_tax)}</TaxAmount>`
          + `<ShippingAmount>${moneyFormat(order.shipping_total)}</ShippingAmount>`
          + '<Gift>false</Gift>'
          + '<GiftMessage></GiftMessage>'
          + '<CustomField1></CustomField1>'
          + '<CustomField2></CustomField2>'
          + '<CustomField3></CustomField3>'
          + '<Customer>'
            + `<CustomerCode>${order.customer_id}</CustomerCode>`
            + '<BillTo>'
              + `<Name>${encapsulateText(order.billing.first_name + order.billing.last_name)}</Name>`
              + `<Company>${encapsulateText(order.billing.company)}</Company>`
              + `<Phone>${encapsulateText(order.billing.phone)}</Phone>`
              + `<Email>${encapsulateText(order.billing.email)}</Email>`
            + '</BillTo>'
            + '<ShipTo>'
              + `<Name>${encapsulateText(order.shipping.first_name + order.shipping.last_name)}</Name>`
              + `<Company>${encapsulateText(order.shipping.company)}</Company>`
              + `<Address1>${encapsulateText(order.shipping.address_1)}</Address1>`
              + `<Address2>${encapsulateText(order.shipping.address_2)}</Address2>`
              + `<City>${encapsulateText(order.shipping.city)}</City>`
              + `<State>${encapsulateText(order.shipping.state)}</State>`
              + `<PostalCode>${encapsulateText(order.shipping.postal_code)}</PostalCode>`
              + `<Country>${encapsulateText(order.shipping.country)}</Country>`
              + `<Phone>${encapsulateText(order.shipping.phone)}</Phone>`
            + '</ShipTo>'
          + '</Customer>'
          + '<Items>'
            + `${itemsXML}`
          + '</Items>'
        + '</Order>';
    });

    resultXML += '</Orders>';

    return resultXML;
  }

  /**
   * Allow ShipStation to Post Shipment Information When Orders Ship
   *
   * req.body format
   * req.body.shipnotice.ordernumber - eg. ABC123
   * req.body.shipnotice.labelcreatedate - eg. 10/08/2018 12:56
   * req.body.shipnotice.shipdate - eg. 10/8/2018
   * req.body.shipnotice.carrier - eg. USPS
   * req.body.shipnotice.service - eg. Priority Mail
   * req.body.shipnotice.trackingnumber - eg. 1Z909084330298430820
   *
   */
  static async shipnotify(req, res) {
    try {
      // fetch order
      const order = await Order.findOne({
        order_number: req.body.shipnotice.ordernumber,
      });
      if (!order) {
        throw new Error('Order not found');
      }

      // update order
      order.status = 'shipped';
      order.tracking_number = req.body.shipnotice.trackingnumber;
      order.ship_date = moment(req.body.shipnotice.shipdate, 'M/D/YYYY').toDate();
      await order.save();

      await ShipstationHookController._sendOrderShippedNotification(order);

      // update stock qty if an order is shipped
      await ItemProductController.decreaseProductQuantity(order);

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * Allow ShipStation to Pull Order Information
   *
   * query param: ?action=export&start_date=[Start Date]&end_date=[End Date]&page=1
   *
   */
  static async export(req, res) {
    try {
      if (!ShipstationHookController._isParamValid(req.query)) {
        throw new Error('Missing required params');
      }

      // get query params
      const startDate = moment.utc(req.query.start_date, 'MM/DD/YYYY HH:mm').toDate();
      const endDate = moment.utc(req.query.end_date, 'MM/DD/YYYY HH:mm').toDate();
      const { page } = parseInt(req.query, 10);
      const limit = 10;
      const filter = {
        status: { $ne: 'pending' },
        dt_updated: { $gte: startDate, $lte: endDate },
        deleted: false,
      };

      // fetch orders
      const total = await Order
        .countDocuments(filter);

      const orders = await Order
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      // build XML
      const resultXML = await ShipstationHookController._buildExportXML(
        orders,
        Math.ceil(parseFloat(total) / limit),
      );

      res.header('Content-Type', 'application/xml; charset=utf-8');
      return res.status(200).send(resultXML);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * endpoints protected by basic authentication
   */
  static async authorize(req, res, next) {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
      return res.error('Missing Authorization Header', 401);
    }

    // verify basic auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (
      username !== global.env.SHIPSTATION_AUTH_USERNAME
      || password !== global.env.SHIPSTATION_AUTH_PASSWORD
    ) {
      return res.error('Invalid Authentication Credentials', 401);
    }

    next();
  }
}
