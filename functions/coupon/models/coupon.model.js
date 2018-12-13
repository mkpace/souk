import mongoose from 'mongoose';

if (!global.CouponSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Coupon Schema
   */
  global.CouponSchema = new mongoose.Schema(
    {
      type: {
        type: String,
        enum: ['percentage', 'fixed_cart', 'fixed_product'],
        required: true,
      },
      code: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
      },
      allow_free_shipping: {
        type: Boolean,
      },
      expiry: {
        type: Date,
      },
      minimum_spend: {
        type: Number,
      },
      maximum_spend: {
        type: Number,
      },
      individual: {
        type: Boolean,
      },
      exclude_sales_items: {
        type: Boolean,
      },
      exclude_products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      deleted: {
        // a logical delete flag for the coupon
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
   * validation - code to be unique
   */
  global.CouponSchema
    .path('code')
    .validate(
      async function uniqueCode(val) {
        try {
          const coupon = await this.model('Coupon').findOne(
            {
              deleted: false,
              code: val,
            },
          );
          if (coupon && coupon._id.toString() !== this._id.toString()) {
            return false;
          }

          return true;
        } catch (err) {
          return false;
        }
      },
      'Duplicate code: {VALUE}',
    );
}

module.exports = {
  Coupon: mongoose.model('Coupon', global.CouponSchema),
};
