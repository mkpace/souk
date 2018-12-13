import _ from 'lodash';

import { Coupon } from '../models/coupon.model';

export default class CouponController {
  /*
   * Returns the list of all coupons
   */
  static async list(req, res) {
    try {
      const coupons = await Coupon.find({ deleted: false });

      return res.success(coupons);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /*
   * Returns the specific coupon by id
   */
  static async couponById(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const coupon = await Coupon.findOne({
        _id: req.params.id,
        deleted: false,
      });

      if (!coupon) {
        return res.error('Coupon with id not found', 404);
      }

      return res.success(coupon);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /*
   * Returns the specific coupon by code
   */
  static async couponByCode(req, res) {
    if (!req.params.code) {
      return res.error('Invalid code supplied');
    }

    try {
      const coupon = await Coupon.findOne({
        code: req.params.code,
        deleted: false,
      });

      if (!coupon) {
        return res.error('Coupon with code not found', 404);
      }

      return res.success(coupon);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /*
   * Update the coupon
   */
  static async update(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const coupon = await Coupon.findOne({
        _id: req.params.id,
        deleted: false,
      });

      if (!coupon) {
        return res.error('Coupon with id not found', 404);
      }

      delete req.body._id; // eslint-disable-line no-underscore-dangle
      const updated = _.assign(coupon, req.body);

      await updated.save();
      return res.success(updated);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /*
   * Logical delete of coupon
   */
  static async destroy(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const coupon = await Coupon.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!coupon) {
        return res.error('Coupon with id not found', 404);
      }

      coupon.deleted = true;
      await coupon.save();

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }

  /*
   * Create a shopping cart for the current customer
   */
  static async create(req, res) {
    try {
      const coupon = new Coupon(req.body);
      await coupon.save();
      return res.success(coupon);
    } catch (err) {
      return res.error(err.message);
    }
  }
}
