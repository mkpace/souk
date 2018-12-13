import mongoose from 'mongoose';

if (!global.DiscountApplicationSchema) {
  mongoose.Promise = global.Promise;

  /**
   * DiscountApplication Schema
   */
  global.DiscountApplicationSchema = new mongoose.Schema(
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      first_name: {
        type: String,
        trim: true,
      },
      last_name: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
          validator: email => /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email),
          message: 'Email is not valid.',
        },
        required: [true, 'Email is required.'],
      },
      document: {
        type: String,
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
}

module.exports = {
  DiscountApplicationSchema: global.DiscountApplicationSchema,
  DiscountApplication: mongoose.model('DiscountApplication', global.DiscountApplicationSchema),
};
