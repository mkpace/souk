import mongoose from 'mongoose';

if (!global.SyncHistorySchema) {
  mongoose.Promise = global.Promise;

  /**
   * SyncHistorySchema
   */
  global.SyncHistorySchema = new mongoose.Schema(
    {
      task: { // sync task name
        type: String,
        required: true,
      },
      last_run_time: {
        type: Date,
      },
      result: {
        type: String,
      },
    },
  );
}

module.exports = {
  SyncHistorySchema: global.SyncHistorySchema,
  SyncHistory: mongoose.model('SyncHistory', global.SyncHistorySchema),
};
