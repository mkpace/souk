import mongoose from 'mongoose';

import { DimensionsSchema } from './dimensions.model';
import { DocumentTypeSchema } from './document.type.model';
import { ImageSchema } from '../../user/models/image.model';
import { VariationSchema } from './variation.model';
import { VariationTypeSchema } from './variation.type.model';

if (!global.ProductSchema) {
  mongoose.Promise = global.Promise;

  /*
   * Product Schema
   * Products can either be a single entity or may have variations.
   * Variations can be strength or quantity.
   * Products and variations are identified by their SKU throughout the platform.
   */
  global.ProductSchema = new mongoose.Schema(
    {
      product_id: { // legacy from WooCommerce, eg. 108628
        type: Number,
      },
      name: { // eg. HP Pavilion
        type: String,
        required: true,
      },
      slug: { // eg. hp-pavilion
        type: String,
      },
      sku: { // eg. HPP15
        type: String,
      },
      categories: [{ // taxonomy categories for item
        type: String,
      }],
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
      potency_results: [{
        type: DocumentTypeSchema,
      }],
      heavy_metals: [{
        type: DocumentTypeSchema,
      }],
      pesticides: [{
        type: DocumentTypeSchema,
      }],
      variations: [{
        type: VariationSchema,
      }],
      variation_types: [{
        type: VariationTypeSchema,
      }],
      featured: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: [
          'published',
          'staged',
        ],
        default: 'staged',
      },
      type: {
        type: String,
        enum: [
          'retail',
          'wholesale',
          'wholesale-rep',
        ],
        default: 'retail',
      },
      order_index: {
        type: Number,
        default: 0,
      },
      retail_only: {
        type: Boolean,
        default: false,
      },
      wholesale_discount: {
        type: Number,
        default: 0.5,
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
   * validation - slug to be unique
   */
  global.ProductSchema
    .path('slug')
    .validate(
      async function uniqueSlug(val) {
        try {
          const product = await this.model('Product').findOne(
            {
              deleted: false,
              slug: val,
            },
          );
          if (product && product._id.toString() !== this._id.toString()) {
            return false;
          }

          return true;
        } catch (err) {
          return false;
        }
      },
      'Duplicate slug: {VALUE}',
    );

  /**
   * validation - sku to be unique
   */
  global.ProductSchema
    .path('sku')
    .validate(
      async function uniqueSku(val) {
        try {
          if (!val) {
            // product sku is empty, as it has variations
            return true;
          }

          const product = await this.model('Product').findOne(
            {
              deleted: false,
              $or: [
                { sku: val },
                { 'variations.sku': val },
              ],
            },
          );

          if (product) {
            // different product has same sku
            if (product._id.toString() !== this._id.toString()) {
              return false;
            }

            // variation inside product has same sku
            if (product.sku !== val) {
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
  ProductSchema: global.ProductSchema,
  Product: mongoose.model('Product', global.ProductSchema),
};
