import mongoose from 'mongoose';

if (!global.EmailTemplateSchema) {
  mongoose.Promise = global.Promise;

  /**
   * EmailTemplate schema, representing the email templates
   * @constructor EmailTemplate
   */
  global.EmailTemplateSchema = new mongoose.Schema(
    {
      name: { // template name
        type: String,
      },
      from: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
          validator: email => !email || /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email),
          message: 'Email is not valid.',
        },
      },
      type: {
        type: String,
        enum: [
          'html',
          'text',
        ],
        default: 'html',
      },
      content: {
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
  EmailTemplateSchema: global.EmailTemplateSchema,
  EmailTemplate: mongoose.model('EmailTemplate', global.EmailTemplateSchema),
};
