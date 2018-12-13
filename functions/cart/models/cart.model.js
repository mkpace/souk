import mongoose from 'mongoose';

import { ItemSchema } from './item.model';

if (!global.CartSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Cart schema, representing a list of items in a user's cart
   * @constructor Cart
   */
  global.CartSchema = new mongoose.Schema(
    {
      user_id: { // unique User id
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      items: [{ // list of products in cart
        type: ItemSchema,
      }],
      deleted: { // a logical delete flag for the cart
        type: Boolean,
        default: false,
      },
    },
    {
      usePushEach: true,
      timestamps: {
        createdAt: 'dt_created',
        updatedAt: 'dt_updated',
      },
    },
  );
}

module.exports = {
  Cart: mongoose.model('Cart', global.CartSchema),
};
