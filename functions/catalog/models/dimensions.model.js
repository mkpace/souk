import mongoose from 'mongoose';

if (!global.DimensionsSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Dimension - Product dimensions
   */
  global.DimensionsSchema = new mongoose.Schema(
    {
      height: {
        type: String,
        required: true,
      },
      width: {
        type: String,
        required: true,
      },
      length: {
        type: String,
        required: true,
      },
    },
    {
      _id: false,
    },
  );
}

module.exports = {
  DimensionsSchema: global.DimensionsSchema,
  Dimensions: mongoose.model('Dimension', global.DimensionsSchema),
};
