import mongoose from 'mongoose';

if (!global.StoreSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Store schema
   */
  global.StoreSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      address_1: {
        type: String,
        required: true,
      },
      address_2: {
        type: String,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
      },
      postal_code: {
        type: String,
      },
      country: {
        type: String,
        required: true,
      },
      latitude: {
        type: String,
      },
      longitude: {
        type: String,
      },
      open_hour: [
        {
          day: {
            type: String,
          },
          open: {
            type: Date,
          },
          close: {
            type: Date,
          },
        },
      ],
      tel: {
        type: String,
      },
      fax: {
        type: String,
      },
      email: {
        type: String,
      },
      url: {
        type: String,
      },
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
}

module.exports = {
  StoreSchema: global.StoreSchema,
  Store: mongoose.model('Store', global.StoreSchema),
};
