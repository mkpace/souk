import mongoose from 'mongoose';

if (!global.VariationTypeSchema) {
  mongoose.Promise = global.Promise;

  /**
   * VariationType schema
   */
  global.VariationTypeSchema = new mongoose.Schema(
    {
      name: { // eg. count
        type: String,
        required: true,
      },
      options: [{ // eg. ['40', '100', '200']
        type: String,
      }],
      type: {
        type: String,
        enum: ['swatch', 'dropdown'],
        default: 'swatch',
      },
    },
  );
}

module.exports = {
  VariationTypeSchema: global.VariationTypeSchema,
  VariationType: mongoose.model('VariationType', global.VariationTypeSchema),
};
