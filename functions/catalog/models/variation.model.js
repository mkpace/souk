import mongoose from 'mongoose';

import { DimensionsSchema } from './dimensions.model';
import { ImageSchema } from '../../user/models/image.model';
import { VariationOptionSchema } from './variation.option.model';

if (!global.VariationSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Variation - A product variation such as size, color, flavor, etc.
   */
  global.VariationSchema = new mongoose.Schema(
    {
      position: {
        type: Number,
        default: 0,
      },
      name: { // eg. HP Pavilion
        type: String,
      },
      slug: { // eg. hp-pavilion
        type: String,
      },
      sku: { // the SKU of the variation of the product
        type: String,
        required: true,
      },
      long_description: {
        type: String,
      },
      short_description: {
        type: String,
      },
      stock_qty: {
        type: Number,
        default: 0,
      },
      show_stock_qty: {
        type: Boolean,
        default: true,
      },
      price: {
        type: String,
      },
      on_sale: {
        type: Boolean,
        default: false,
      },
      dimensions: {
        type: DimensionsSchema,
        required: true,
      },
      weight: { // weight in grams(G)
        type: Number,
        required: true,
      },
      backordered: {
        type: Boolean,
        default: false,
      },
      backorders_allowed: {
        type: Boolean,
        default: false,
      },
      images: [{
        type: ImageSchema,
      }],
      variation_options: [{
        type: VariationOptionSchema,
      }],
      wholesale_discount: {
        type: Number,
        default: 0.5,
      },
      order_index: {
        type: Number,
        default: 0,
      },
      deleted: { // a logical delete flag for the cart
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
   * validation - sku to be unique
   */
  global.VariationSchema
    .path('sku')
    .validate(
      async function (val) { // eslint-disable-line func-names
        try {
          const product = await mongoose.model('Product').findOne(
            {
              deleted: false,
              $or: [
                { sku: val },
                { 'variations.sku': val },
              ],
            },
          );

          if (product) {
            // product has same sku
            if (product.sku === val) {
              return false;
            }

            const variation = product.variations.find(v => v.sku === val);
            if (variation._id.toString() !== this._id.toString()) {
              // different variation has same sku
              return false;
            }
          }

          return true;
        } catch (err) {
          return false;
        }
      },
      'Duplicate SKU: {VALUE}',
    );
}

module.exports = {
  VariationSchema: global.VariationSchema,
  Variation: mongoose.model('Variation', global.VariationSchema),
};
