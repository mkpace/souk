import mongoose from 'mongoose';

if (!global.CountrySchema) {
  mongoose.Promise = global.Promise;

  /**
   * Country schema
   */
  global.CountrySchema = new mongoose.Schema(
    {
      code: { // the country code
        type: String,
      },
      name: { // the country name
        type: String,
      },
      deleted: { // a logical delete flag
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
  CountrySchema: global.CountrySchema,
  Country: mongoose.model('Country', global.CountrySchema),
};
