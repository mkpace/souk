import mongoose from 'mongoose';

if (!global.ItemSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Item schema, representing a product item in the cart
   * @constructor Item
   */
  global.ItemSchema = new mongoose.Schema(
    {
      sku: { // Item SKU pointing to single product or product variation
        type: String,
        required: true,
      },
      count: { // Number of items
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: {
        createdAt: 'dt_created',
        updatedAt: 'dt_updated',
      },
    },
  );
}

module.exports = {
  ItemSchema: global.ItemSchema,
  Item: mongoose.model('Item', global.ItemSchema),
};
