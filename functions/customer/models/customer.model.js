import mongoose from 'mongoose';

import { BillingSchema } from './billing.model';
import { ShippingSchema } from './shipping.model';

if (!global.CustomerSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Customer schema
   * @constructor Customer
   */
  global.CustomerSchema = new mongoose.Schema(
    {
      id: { // legacy id from WooCommerce
        type: String,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      dt_last_active: {
        type: Date,
      },
      dt_approved: {
        type: Date,
      },
      approved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      type: {
        type: String,
        enum: [
          'retail',
          'wholesale',
          'wholesale-rep',
          'discount',
          'affiliate',
        ],
        default: 'retail',
      },
      company: { // eg. Wholesaler
        type: String,
      },
      website: {
        type: String,
      },
      billing: {
        type: BillingSchema,
      },
      shipping: {
        type: ShippingSchema,
      },
      tax_exemption: {
        type: Boolean,
        default: true,
      },
      wholesale_discount: {
        type: Boolean,
        default: true,
      },
      shipping_zone: { // UPS Zone - eg. 0
        type: String,
      },
      referredby: { // Wholesale rep - eg. Brad
        type: String,
      },
      attachment: { // Link to document stored on S3
        type: String,
      },
      shipping_same: {
        type: Boolean,
        default: true,
      },
      subscribe: { // opt-in to marketing and promotional info email
        type: Boolean,
        default: false,
      },
      deleted: { // Logical delete
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: {
        createdAt: 'dt_created',
        updatedAt: 'dt_updated',
      },
    },
  );

  global.CustomerSchema.index({ dt_created: 1 });
}

module.exports = {
  CustomerSchema: global.CustomerSchema,
  Customer: mongoose.model('Customer', global.CustomerSchema),
};
