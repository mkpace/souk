import mongoose from 'mongoose';

if (!global.OrderNoteSchema) {
  mongoose.Promise = global.Promise;

  /**
   * OrderNote schema
   */
  global.OrderNoteSchema = new mongoose.Schema(
    {
      message: {
        type: String,
      },
      type: {
        type: String,
        enum: ['private', 'public'],
        default: 'private',
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
  OrderNoteSchema: global.OrderNoteSchema,
  OrderNote: mongoose.model('OrderNote', global.OrderNoteSchema),
};
