import _ from 'lodash';

import { Customer } from '../../customer/models/customer.model';
import { generateToken } from '../../auth/controllers/auth.controller';
import { POPULATE_FIELDS, User } from '../../user/models/user.model';
import uploadToS3 from '../../common/utils/upload';

export default class AccountController {
  /**
   * returns customer information if the user is a kind of customer
   */
  static async me(req, res) {
    try {
      const customer = await Customer.findOne({
        user: req.user._id,
        deleted: false,
      });
      if (!customer) {
        return res.success(req.user.profile);
      }

      await Customer.populate(customer, { path: 'user', select: POPULATE_FIELDS });
      await Customer.populate(customer, { path: 'approved_by', select: POPULATE_FIELDS });

      return res.success(customer);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async update(req, res) {
    let { user } = req;

    try {
      delete user.roles;
      user = _.extend(user, req.body);
      await user.save();

      req.login(user, { session: false }, (loginErr) => {
        if (loginErr) {
          return res.error(loginErr.message);
        }

        const token = generateToken(user);
        return res.success({ token });
      });
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async changePassword(req, res) {
    const passwordDetails = req.body;

    try {
      const user = await User.findById(req.user._id);

      // validation check
      if (!user) {
        return res.error('User is not found');
      }

      if (!user.authenticate(passwordDetails.currentPassword)) {
        return res.error('Current password is incorrect');
      }

      if (passwordDetails.newPassword !== passwordDetails.verifyPassword) {
        return res.error('Passwords do not match');
      }

      // update user password
      user.password = passwordDetails.newPassword;
      await user.save();

      // log in
      req.login(user, { session: false }, (loginErr) => {
        if (loginErr) {
          return res.error(loginErr.message);
        }

        return res.success('Password changed successfully');
      });
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async changeProfilePicture(req, res) {
    try {
      // upload photo to S3
      const filePath = await uploadToS3(req.body.photo, 'avatars');

      // update user image attribute
      const user = _.assign(
        req.user,
        {
          image: {
            src: filePath,
            alt: 'avatar',
          },
        },
      );
      await user.save();

      return res.success(user.profile);
    } catch (err) {
      return res.error(err.message);
    }
  }
}
