import _ from 'lodash';

import { Product } from '../models/product.model';
import uploadToS3 from '../../common/utils/upload';

export default class CatalogController {
  /**
   * get the list of product catalogs
   */
  static async list(req, res) {
    try {
      const filter = { deleted: false };
      let sort = 'dt_created';

      if (req.query.featured) {
        filter.featured = (req.query.featured === 'true');
      }
      if (req.query.type === 'wholesale') {
        filter.retail_only = false;
      }
      if (req.query.sort) {
        ({ sort } = req.query);
      }

      const products = await Product
        .find(filter)
        .sort(sort)
        .exec();

      return res.products_with_additional_prices(products);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * create a new product
   */
  static async create(req, res) {
    try {
      const product = await Product.create(req.body);

      return res.products_with_additional_prices(product);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * get the specified product item
   */
  static async get(req, res) {
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

      return res.products_with_additional_prices(product);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * update the shopping catalog for the specified item
   */
  static async update(req, res) {
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

      delete req.body._id; // eslint-disable-line no-underscore-dangle
      const updated = _.assign(product, req.body);
      updated._id = req.params.id;
      await updated.save();

      return res.products_with_additional_prices(updated);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async destroy(req, res) {
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

      product.deleted = true;
      await product.save();

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * thumbnail size should not exceed over 10MB
   */
  static async uploadThumbnail(req, res) {
    try {
      // upload thumbnail to S3
      const filePath = await uploadToS3(req.body.thumbnail, 'product-thumbnails');

      return res.success(filePath);
    } catch (err) {
      return res.error(err.message);
    }
  }
}
