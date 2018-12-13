import mongoose from 'mongoose';

if (!global.ImageSchema) {
  mongoose.Promise = global.Promise;

  /**
   * Image [jpg|png|gif]
   */
  global.ImageSchema = new mongoose.Schema(
    {
      caption: { // image caption, eg. Product Desctiption
        type: String,
      },
      src: {
        type: String,
        validate: {
          validator: src => !src || /^(http|https):\/\//.test(src),
          message: 'Image source link is broken',
        },
      },
      alt: { // alt text
        type: String,
      },
      position: { // index position if there are multiples
        type: Number,
        default: 0,
      },
      type: { // the image type Thumbnail/Large
        type: String,
        enum: ['small-thumbnail', 'thumbnail', 'large'],
        default: 'small-thumbnail',
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
  ImageSchema: global.ImageSchema,
  Image: mongoose.model('Image', global.ImageSchema),
};
