import mongoose from 'mongoose';

if (!global.DocumentTypeSchema) {
  mongoose.Promise = global.Promise;

  /**
   * DocumentType - Product document for potency, heavy_metals and pesticides results
   */
  global.DocumentTypeSchema = new mongoose.Schema(
    {
      url: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      author: {
        type: String,
      },
      publishDate: {
        type: String,
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
  DocumentTypeSchema: global.DocumentTypeSchema,
  DocumentType: mongoose.model('DocumentType', global.DocumentTypeSchema),
};
