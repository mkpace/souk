import mongoose from 'mongoose';

if (!global.ContactSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Contact schema
   */
  global.ContactSchema = new mongoose.Schema(
    {
      first_name: {
        type: String,
        required: true,
      },
      last_name: {
        type: String,
        required: true,
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
      phone: {
        type: String,
        required: true,
      },
      subject: {
        type: String,
        enum: [
          'general-question',
          'order-issue',
          'shipping-issue',
          'wholesale',
          'affiliate',
          'other',
        ],
        default: 'other',
      },
      message: {
        type: String,
        required: true,
      },
      deleted: { // a logical delete flag for the cart
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: {
        createdAt: 'dt_created',
      },
    },
  );
}

module.exports = {
  ContactSchema: global.ContactSchema,
  Contact: mongoose.model('Contact', global.ContactSchema),
};
