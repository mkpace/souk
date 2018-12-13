import _ from 'lodash';

import { Customer } from '../../customer/models/customer.model';
import { Product } from '../../catalog/models/product.model';
import PriceController from '../../catalog/controllers/price.controller';

/**
 * return items with `product` attribute filled
 */
export default class ItemProductController {
  /**
   * we return `product` as well, along with sku
   */
  static res_item_with_products(req, res, next) { // eslint-disable-line camelcase
    res.item_with_products = async (carts, code = 200) => {
      let cartObjArray;
      if (Array.isArray(carts)) {
        cartObjArray = _.map(carts, cart => cart.toObject());
      } else {
        cartObjArray = carts.toObject();
      }

      await ItemProductController._addProductsForOrders(cartObjArray);
      return res.status(code).json(cartObjArray);
    };

    next();
  }

  /**
   * @pararm {Array|Object} orders
   */
  static async _addProductsForOrders(orders) {
    try {
      if (Array.isArray(orders)) {
        const productPromises = [];
        _.each(orders, (order) => {
          productPromises.push(ItemProductController._addProductsForSingleOrder(order));
        });

        await Promise.all(productPromises);
      } else {
        await ItemProductController._addProductsForSingleOrder(orders);
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * add `product` attribute to each item of an order
   * @param {Object} order
   */
  static async _addProductsForSingleOrder(order) {
    const promises = [];

    const customerType = await ItemProductController._getCustomerType(order);
    _.each(order.items, (item) => {
      promises.push((async () => {
        try {
          const product = await ItemProductController._findProductForSku(item.sku);
          const productObj = product.toObject();

          await PriceController._addPriceForSingleProduct(customerType, productObj);
          return productObj;
        } catch (err) {
          return null;
        }
      })());
    });

    const products = await Promise.all(promises);
    _.each(order.items, (item, index) => {
      _.set(item, 'product', products[index]);
    });
  }

  /**
   * order can either be `Order` model or `Cart` model
   */
  static async _getCustomerType(order) {
    let customer;

    if (order.customer_id) {
      customer = await Customer.findOne({ _id: order.customer_id });
    } else if (order.user_id) {
      customer = await Customer.findOne({ user: order.user_id });
    }

    return customer ? customer.type : null;
  }

  static async _findProductForSku(sku) {
    try {
      const product = await Product.findOne({
        $or: [{ sku }, { 'variations.sku': sku }],
        deleted: false,
      });

      return product;
    } catch (err) {
      throw err;
    }
  }

  /**
   * decreases the quantity of ordered items in the stock
   * function to be called when a new order is created
   */
  static async decreaseProductQuantity(order) {
    try {
      const promises = [];

      _.each(order.items, (item) => {
        promises.push((async () => {
          const product = await ItemProductController._findProductForSku(item.sku);

          if (product.sku === item.sku) {
            product.stock_qty -= item.count;
          } else {
            const matched = _.findIndex(
              product.variations,
              variation => variation.sku === item.sku,
            );
            product.variations[matched].stock_qty -= item.count;
          }

          await product.save();
        })());
      });

      await Promise.all(promises);
    } catch (err) {
      throw err;
    }
  }
}
