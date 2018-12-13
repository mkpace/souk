import _ from 'lodash';

import { Cart } from '../models/cart.model';
import ItemProductController from './item.product.controller';

export default class CartController {
  /**
   * check if items in cart are available in stock
   * @return boolean
   */
  static async _checkProductsAvailInStock(cart) {
    let invalid = '';
    const tempCart = (typeof cart !== 'object' ? cart.toObject() : cart);

    await ItemProductController._addProductsForSingleOrder(tempCart);
    _.each(tempCart.items, (item) => {
      // invalid sku
      if (!item.product) {
        invalid = item.sku;
        return false;
      }

      // if item is a product
      if (item.product.sku === item.sku) {
        if (item.count > item.product.stock_qty) {
          invalid = item.sku;
          return false;
        }

        return;
      }

      // if item is a product variation
      _.each(item.product.variations, (variation) => {
        if (variation.sku === item.sku) {
          if (item.count > variation.stock_qty) {
            invalid = item.sku;
          }

          return false;
        }
      });

      if (invalid !== '') {
        return false;
      }
    });

    return invalid;
  }

  /*
   * Returns the list of all shopping carts
   */
  static async list(req, res) {
    try {
      const carts = await Cart.find({ deleted: false });

      return res.item_with_products(carts);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /*
   * The shopping cart holds the products the customer is considering purchasing
   */
  static async cartById(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const cart = await Cart.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!cart) {
        return res.error('Item with id not found', 404);
      }

      return res.item_with_products(cart);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /*
   * The shopping cart holds the products the customer is considering purchasing
   * Returns only available cart (not deleted)
   */
  static async cartByUser(req, res) {
    if (!req.params.user_id) {
      return res.error('Invalid id supplied');
    }

    try {
      const cart = await Cart.findOne({
        user_id: req.params.user_id,
        deleted: false,
      });
      if (!cart) {
        return res.error('Item with id not found', 404);
      }

      return res.item_with_products(cart);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /*
   * Update the shopping cart for the current customer
   * Deleted cart cannot be updated
   */
  static async update(req, res) {
    if (!req.params.user_id) {
      return res.error('Invalid id supplied');
    }

    try {
      const cart = await Cart.findOne({
        user_id: req.params.user_id,
        deleted: false,
      });
      if (!cart) {
        return res.error('Item with id not found', 404);
      }

      // check if we have enough items in stock
      // we are only comparing *updated* cart items
      const diff = { items: [] };
      _.each(req.body.items, (item) => {
        const cartItem = _.find(cart.items, { sku: item.sku });
        if (cartItem && parseInt(cartItem.count, 10) !== parseInt(item.count, 10)) {
          diff.items.push(item);
        }
      });
      const invalid = await CartController._checkProductsAvailInStock(diff);
      if (invalid !== '') {
        return res.error(`Item '${invalid}' is not sufficient in stock`);
      }

      // update cart
      delete req.body._id; // eslint-disable-line no-underscore-dangle
      const updated = _.assign(cart, req.body);

      await updated.save();
      return res.item_with_products(updated);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /*
   * Logical delete of cart item - usually performed after a checkout
   */
  static async destroy(req, res) {
    if (!req.params.user_id) {
      return res.error('Invalid id supplied');
    }

    try {
      const cart = await Cart.findOne({
        user_id: req.params.user_id,
        deleted: false,
      });
      if (!cart) {
        return res.error('Item with id not found', 404);
      }

      cart.deleted = true;
      await cart.save();

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }

  /*
   * Create a shopping cart for the current customer
   */
  static async create(req, res) {
    if (!req.params.user_id) {
      return res.error('Invalid id supplied');
    }

    try {
      const oldCart = await Cart.findOne({
        user_id: req.params.user_id,
        deleted: false,
      });
      if (oldCart) {
        return res.error('Duplicate item found');
      }

      const cart = new Cart({
        user_id: req.params.user_id,
        items: req.body.items,
      });
      const invalid = await CartController._checkProductsAvailInStock(cart);
      if (invalid !== '') {
        return res.error(`Item '${invalid}' is not sufficient in stock`);
      }

      await cart.save();
      return res.item_with_products(cart);
    } catch (err) {
      return res.error(err.message);
    }
  }
}
