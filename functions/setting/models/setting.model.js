import mongoose from 'mongoose';

if (!global.SettingSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Setting schema
   */
  global.SettingSchema = new mongoose.Schema(
    {
      key: {
        type: String,
      },
      value: {
        type: String,
      },
      description: {
        type: String,
      },
      additional_options: {},
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
  SettingSchema: global.SettingSchema,
  Setting: mongoose.model('Setting', global.SettingSchema),
};
