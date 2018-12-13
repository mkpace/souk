import mongoose from 'mongoose';

if (!global.MethodSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Method schema
   * A shipping method applies to all customers within the
   * specfied shipping zone when added to a particular zone
   *
   * @constructor Method
   */
  global.MethodSchema = new mongoose.Schema(
    {
      name: {
        type: String,
      },
      description: {
        type: String,
      },
      strategy: {
        type: String,
      },
      enabled: {
        type: Boolean,
      },
    },
  );
}

module.exports = {
  MethodSchema: global.MethodSchema,
  Method: mongoose.model('Method', global.MethodSchema),
};
