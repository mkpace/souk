import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { ImageSchema } from './image.model';
import EmailController from '../../email/controllers/email.controller';

const POPULATE_FIELDS = '_id first_name last_name username email roles status image dt_created dt_updated';

if (!global.UserSchema) {
  mongoose.Promise = global.Promise;

  /**
   * User Schema - A user of the system
   */
  global.UserSchema = new mongoose.Schema(
    {
      first_name: {
        type: String,
        trim: true,
      },
      last_name: {
        type: String,
        trim: true,
      },
      username: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
          validator: email => /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email),
          message: 'Email is not valid.',
        },
        required: [true, 'Email is required.'],
      },
      passwordHash: {
        type: String,
      },
      roles: {
        type: [{
          type: String,
          enum: [
            'administrator',
            'editor',
            'viewer',
            'customer',
          ],
        }],
        required: [true, 'Please provide at least one role'],
      },
      image: ImageSchema,
      status: {
        type: String,
        enum: [
          'approved',
          'pending',
          'suspended',
        ],
        default: 'pending',
      },
      pin: {
        type: String,
        validate: {
          validator: pin => !pin || pin.length >= 4,
          message: 'Pincode must be at least 4 chars long.',
        },
      },
      deleted: { // a logical delete flag for the cart
        type: Boolean,
        default: false,
      },

      /* for social login */
      provider: {
        type: String,
      },
      providerData: {},
      additionalProvidersData: {},

      /* for reset password */
      resetPasswordToken: {
        type: String,
      },
      resetPasswordExpires: {
        type: Date,
      },
    },
    {
      timestamps: {
        createdAt: 'dt_created',
        updatedAt: 'dt_updated',
      },
    },
  );

  /**
   * virtual `password` field
   */
  global.UserSchema
    .virtual('password')
    .set(function (password) { // eslint-disable-line func-names
      this.passwordHash = bcrypt.hashSync(password, 10);
    });

  /**
   * virtual `profile` field
   */
  global.UserSchema
    .virtual('profile')
    .get(function () { // eslint-disable-line func-names
      return {
        _id: this._id,
        first_name: this.first_name,
        last_name: this.last_name,
        username: this.username,
        email: this.email,
        roles: this.roles,
        status: this.status,
        image: this.image,
        dt_created: this.dt_created,
        dt_updated: this.dt_updated,
      };
    });

  /**
   * validation - username to be unique
   */
  global.UserSchema
    .path('username')
    .validate(
      async function (val) { // eslint-disable-line func-names
        if (!val.trim()) { // for social login, it might be empty
          return true;
        }

        try {
          const user = await this.model('User').findOne({
            _id: {
              $ne: this._id,
            },
            username: val.trim(),
            deleted: false,
          });
          if (user) {
            return false;
          }

          return true;
        } catch (err) {
          return false;
        }
      },
      'This username already exists.',
    );

  /**
   * validation - email to be unique
   */
  global.UserSchema
    .path('email')
    .validate(
      async function (val) { // eslint-disable-line func-names
        try {
          const user = await this.model('User').findOne({
            _id: {
              $ne: this._id,
            },
            email: val.trim(),
            deleted: false,
          });
          if (user) {
            return false;
          }

          return true;
        } catch (err) {
          return false;
        }
      },
      'This email already exists.',
    );

  /**
   * authenticate - check if the passwords are the same
   * @param {String} plainText
   * @return {Boolean}
   */
  global.UserSchema.methods.authenticate = function (plainText) { // eslint-disable-line func-names
    return bcrypt.compareSync(plainText, this.passwordHash);
  };

  /**
   * send email notification on user approval
   */
  global.UserSchema
    .pre('save', async function sendApprovalNotification(next) {
      if (
        !this.isNew
        && this.isModified('status')
        && this.status === 'approved'
      ) {
        await EmailController.processEmail(
          'Wholesale Registration Account Approval',
          'wholesale-approval',
          {
            first_name: this.first_name,
            last_name: this.last_name,
            login_url: global.env.FRONT_BASE_URL,
          },
          [this.email],
        );
      }

      next();
    });
}

module.exports = {
  UserSchema: global.UserSchema,
  User: mongoose.model('User', global.UserSchema),
  POPULATE_FIELDS,
};
