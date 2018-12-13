import crypto from 'crypto';

import { User } from '../../user/models/user.model';
import EmailController from '../../email/controllers/email.controller';

export default class PasswordController {
  static async forgot(req, res) {
    try {
      // find user
      const user = await User.findOne({
        email: req.body.email,
        deleted: false,
      });

      // would allow only customers to reset passwords
      if (!user || user.roles.indexOf('customer') < 0) {
        return res.error('User not found');
      }

      // generate token
      const buffer = crypto.randomBytes(20);
      const token = buffer.toString('hex');

      // update user
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + (3600 * 1000); // 1 hour
      await user.save();

      await EmailController.processEmail(
        'Password Reset',
        'forgot-password',
        {
          name: `${user.first_name} ${user.last_name}`,
          url: `${global.env.FRONT_BASE_URL}/reset-password?token=${token}`,
        },
        [user.email],
      );

      return res.success({
        message: 'An email has been sent to the provided email with further instructions',
      });
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async forgotAdmin(req, res) {
    try {
      // find administrator
      const user = await User.findOne({
        email: req.body.email,
        deleted: false,
      });

      // would allow only admins to reset passwords
      if (!user || user.roles.indexOf('administrator') < 0) {
        return res.error('User not found');
      }

      // generate token
      const buffer = crypto.randomBytes(20);
      const token = buffer.toString('hex');

      // update user
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + (3600 * 1000); // 1 hour
      await user.save();

      await EmailController.processEmail(
        'Password Reset',
        'forgot-password',
        {
          name: `${user.first_name} ${user.last_name}`,
          url: `${global.env.ADMIN_BASE_URL}/reset-password?token=${token}`,
        },
        [user.email],
      );

      return res.success({
        message: 'An email has been sent to the provided email with further instructions',
      });
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async validateResetToken(req, res) {
    if (!req.params.token) {
      return res.error('Invalid request');
    }

    try {
      const user = await User.findOne({
        deleted: false,
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now(),
        },
      });
      if (!user) {
        return res.error('Invalid request');
      }

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async reset(req, res) {
    if (req.body.newPassword !== req.body.verifyPassword) {
      return res.error('Passwords are not equal');
    }

    try {
      // find user
      const user = await User.findOne({
        deleted: false,
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now(),
        },
      });
      if (!user) {
        return res.error('Invalid token');
      }

      // update user
      user.password = req.body.newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      await EmailController.processEmail(
        'Password Reset Confirmation',
        'reset-password',
        {
          name: `${user.first_name} ${user.last_name}`,
        },
        [user.email],
      );

      return res.success({ message: 'Password reset successfully' });
    } catch (err) {
      return res.error(err.message);
    }
  }
}
