import mongoose from 'mongoose';

if (!global.VariationOptionSchema) {
  mongoose.Promise = global.Promise;

  /**
   * VariationOption schema
   */
  global.VariationOptionSchema = new mongoose.Schema(
    {
      name: { // eg. count
        type: String,
        required: true,
      },
      option: { // eg. '40'
        type: String,
      },
    },
  );
}

module.exports = {
  VariationOptionSchema: global.VariationOptionSchema,
  VariationOption: mongoose.model('VariationOption', global.VariationOptionSchema),
};
