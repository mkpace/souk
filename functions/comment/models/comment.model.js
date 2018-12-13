import mongoose from 'mongoose';

if (!global.CommentSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Comment schema
   */
  global.CommentSchema = new mongoose.Schema(
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
      },
      comment: {
        type: String,
      },
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      modified_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      approved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: [
          'pending',
          'approved',
          'spam',
        ],
        default: 'pending',
      },
      ip: {
        type: String,
      },
      deleted: { // a logical delete flag for the cart
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: {
        createdAt: 'dt_created',
        updatedAt: 'dt_modified',
      },
    },
  );
}

module.exports = {
  CommentSchema: global.CommentSchema,
  Comment: mongoose.model('Comment', global.CommentSchema),
};
