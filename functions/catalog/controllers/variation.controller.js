import _ from 'lodash';
import mongoose from 'mongoose';

import { Product } from '../models/product.model';
import { Variation } from '../models/variation.model';

export default class VariationController {
  static async findProduct(req, res, next) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const product = await Product.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!product) {
        return res.error('Item with id not found', 404);
      }

      req.product = product;
      next();
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * get the list of product variations
   */
  static async list(req, res) {
    const variations = _.filter(
      req.product.variations,
      variation => !variation.deleted,
    );

    return res.products_with_additional_prices(variations);
  }

  /**
   * create a new product variation
   */
  static async create(req, res) {
    try {
      const variation = new Variation(req.body);

      req.product.variations.push(variation);
      await req.product.save();

      return res.products_with_additional_prices(variation);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * get the specified product variation
   */
  static async get(req, res) {
    if (!req.params.variation_id) {
      return res.error('Invalid id supplied');
    }

    const variation = _.find(
      req.product.variations,
      {
        _id: mongoose.Types.ObjectId(req.params.variation_id),
        deleted: false,
      },
    );
    if (!variation) {
      return res.error('Item with id not found', 404);
    }

    return res.products_with_additional_prices(variation);
  }

  /**
   * update the catalog for the specified variation item
   */
  static async update(req, res) {
    if (!req.params.variation_id) {
      return res.error('Invalid id supplied');
    }

    try {
      let variation = _.find(
        req.product.variations,
        {
          _id: mongoose.Types.ObjectId(req.params.variation_id),
          deleted: false,
        },
      );
      if (!variation) {
        return res.error('Item with id not found', 404);
      }

      delete req.body._id;
      variation = _.assign(variation, req.body);
      await req.product.save();

      return res.products_with_additional_prices(variation);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * logical delete of a product variation
   */
  static async destroy(req, res) {
    if (!req.params.variation_id) {
      return res.error('Invalid id supplied');
    }

    try {
      const variation = _.find(
        req.product.variations,
        {
          _id: mongoose.Types.ObjectId(req.params.variation_id),
          deleted: false,
        },
      );
      if (!variation) {
        return res.error('Item with id not found', 404);
      }

      variation.deleted = true;
      await req.product.save();

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }
}
