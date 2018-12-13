import mongoose from 'mongoose';

import { BillingSchema } from '../../customer/models/billing.model';
import { ItemSchema } from '../../cart/models/item.model';
import { ShippingSchema } from '../../customer/models/shipping.model';
import { OrderNoteSchema } from './order.note.model';
import { OrderRefundSchema } from './order.refund.model';

if (!global.OrderSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Order schema
   * An order for a specified customer
   */
  global.OrderSchema = new mongoose.Schema(
    {
      order_number: {
        type: String,
        unique: true,
      },
      customer_id: { // an id for the specified Customer
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
      },
      billing: {
        type: BillingSchema,
      },
      shipping: {
        type: ShippingSchema,
      },
      created_via: {
        type: String,
        enum: ['checkout', 'manual'],
        default: 'checkout',
      },
      status: {
        type: String,
        enum: [
          'pending',
          'failed',
          'paid',
          'shipped',
          'refunded',
          'cancelled',
          'on-hold',
        ],
        default: 'pending',
        set: function setStatus(status) {
          this._status = this.status;
          return status;
        },
      },
      currency: { // eg. USD
        type: String,
        default: 'USD',
      },
      invoice_number: { // eg. 2230
        type: Number,
      },
      discount: { // discount percentage
        type: Number,
        default: 0,
      },
      discount_total: { // total value of discount
        type: Number,
        default: 0,
      },
      discount_tax: { // tax on discounted amount
        type: Number,
        default: 0,
      },
      shipping_total: { // eg. 7.12
        type: Number,
        default: 0,
      },
      shipping_tax: { // tax charged on shipping (break-out)
        type: Number,
        default: 0,
      },
      tracking_number: { // eg. MG2018
        type: String,
      },
      type: {
        type: String,
        enum: ['retail', 'wholesale', 'discount', 'affiliate', 'coupon'],
      },
      terms: {
        type: String,
        enum: [
          '5% upfront / 50% net 30',
          '50% upfront / 50% net 30',
          '50% upfront',
          '50% Prior to Shipping',
          'CIA',
          'COD',
          'Due In Advance',
          'Due on Receipt',
          'Net 15',
          'Net 30',
          'Net 60',
          'Web Order',
        ],
      },
      rep: {
        type: String,
      },
      ship_via: {
        type: String,
      },
      fob: { // eg. Seattle
        type: String,
      },
      ship_date: {
        type: Date,
      },
      total: { // total amount charged to customer including tax and shipping
        type: Number,
        default: 0,
      },
      total_tax: { // total amount of tax charged
        type: Number,
        default: 0,
      },
      prices_include_tax: {
        type: Boolean,
        default: true,
      },
      payment_method: { // eg. credit-card
        type: String,
      },
      transaction_id: { // a transaction ID from the gateway provider
        type: String,
      },
      dt_paid: {
        type: Date,
      },
      dt_completed: {
        type: Date,
      },
      items: [{
        type: ItemSchema,
      }],
      refunds: [{
        type: OrderRefundSchema,
      }],
      weight: { // weight in grams(G)
        type: Number,
        required: true,
      },
      ip: {
        type: String,
      },
      notes: [{
        type: OrderNoteSchema,
      }],
      deleted: {
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

  /**
   * update order notes on status change
   */
  global.OrderSchema
    .pre('save', function updateNote(next) {
      if (
        !this.isNew
        && this.isModified('status')
      ) {
        this.notes.push({
          message: `Order status changed from "${this._status}" to "${this.status}".`,
          type: 'private',
        });
      }

      next();
    });
}

module.exports = {
  OrderSchema: global.OrderSchema,
  Order: mongoose.model('Order', global.OrderSchema),
};
