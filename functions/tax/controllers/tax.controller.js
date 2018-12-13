import _ from 'lodash';

import WaTax from '../lib/wa-tax';
import { Tax } from '../models/tax.model';

export default class TaxController {
  /**
   * Returns an array of all tax entries for state and local
   */
  static async list(req, res) {
    const city = req.query.city || '';

    try {
      const taxes = await Tax.find({ city: new RegExp(`^${city}$`, 'i') });

      return res.success(taxes);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * Returns the specified product object
   */
  static async getOne(req, res) {
    if (!req.params.id) {
      return res.error('invalid id');
    }

    try {
      const tax = await Tax.findOne({ _id: req.params.id });

      return res.success(tax);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * Update tax properties for the specified item
   */
  static async update(req, res) {
    if (!req.params.id) {
      return res.error('invalid id');
    }

    try {
      const tax = await Tax.findOne({ _id: req.params.id });
      if (!tax) {
        return res.error('not found');
      }

      delete req.body._id; // eslint-disable-line no-underscore-dangle
      const updated = _.assign(tax, req.body);
      await updated.save();

      return res.success(updated);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * Logical delete of tax entry - we don't actually delete any products. Set the flag for deleted.
   */
  static async destroy(req, res) {
    if (!req.params.id) {
      return res.error('invalid id');
    }

    try {
      await Tax.update(
        { _id: req.params.id },
        { deleted: true },
        { multi: false },
      );

      return res.success();
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * Create a new tax item
   */
  static async create(req, res) {
    try {
      const tax = await Tax.create(new Tax(req.body));

      return res.success(tax);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * Get tax rate for WA
   */
  static async getRate(req, res) {
    try {
      if (!req.query.state === 'WA') {
        throw new Error('Only available to WA state');
      }

      const tax = await WaTax.getRate({
        city: req.query.city || '',
        postal_code: req.query.postal_code || '',
      });
      return res.success(tax);
    } catch (err) {
      return res.error(err.message);
    }
  }
}
