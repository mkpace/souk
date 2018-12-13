import mongoose from 'mongoose';

if (!global.ExceptionsSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Exceptions schema - the countries that we do not sell to
   *
   * This is a list of countries that are excluded.
   *
   * @constructor Exceptions
   */
  global.ExceptionsSchema = new mongoose.Schema(
    {
      exceptions: [String],
    },
  );
}

module.exports = {
  ExceptionsSchema: global.ExceptionsSchema,
  Exceptions: mongoose.model('Exceptions', global.ExceptionsSchema),
};
