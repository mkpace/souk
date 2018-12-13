import _ from 'lodash';

import { User } from '../models/user.model';
import EmailController from '../../email/controllers/email.controller';
import uploadToS3 from '../../common/utils/upload';

export default class UserController {
  /**
   * return an array of all users
   */
  static async list(req, res) {
    try {
      const filter = { deleted: false };
      let sort = 'dt_created';

      if (req.query.sort) {
        ({ sort } = req.query);
      }
      if (req.query.status) {
        filter.status = req.query.status.toLowerCase();
      }
      if (req.query.q) {
        const keyword = new RegExp(req.query.q, 'i');
        filter.$or = [
          { first_name: { $regex: keyword } },
          { last_name: { $regex: keyword } },
          { username: { $regex: keyword } },
          { email: { $regex: keyword } },
        ];
      }

      // calculate total numbers
      const total = await User
        .countDocuments(filter);

      // pagination configuration
      const pageOptions = {
        page: parseInt(req.query.page || 0, 10),
        count: parseInt(req.query.count, 10) === -1 ? total : parseInt(req.query.count || 10, 10),
      };

      const users = await User
        .find(
          filter,
          '-passwordHash -pin',
        )
        .sort(sort)
        .skip(pageOptions.page * pageOptions.count)
        .limit(pageOptions.count)
        .exec();

      return res.success({
        total,
        page: pageOptions.page,
        count: pageOptions.count,
        users,
      });
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * add a new user
   */
  static async create(req, res) {
    try {
      const user = await User.create(req.body);

      return res.success(user.profile);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * update a user object properties
   */
  static async update(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const user = await User.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!user) {
        return res.error('User with id not found', 404);
      }

      delete req.body._id; // eslint-disable-line no-underscore-dangle
      delete req.body.password;
      const updated = _.assign(user, req.body);
      await updated.save();

      return res.success(updated.profile);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * users are never deleted only flagged as deleted
   */
  static async destroy(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const user = await User.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!user) {
        return res.error('User with id not found', 404);
      }

      user.deleted = true;
      await user.save();

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * upload photo to S3
   * photo included a request body as a base64 encoded string
   */
  static async uploadAvatar(req, res) {
    try {
      // upload avatar to S3
      const filePath = await uploadToS3(req.body.avatar, 'avatars');

      return res.success(filePath);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * logical delete of user
   */
  static async destroyByEmail(req, res) {
    if (!req.params.email) {
      return res.error('Invalid email supplied');
    }

    try {
      const user = await User.findOne({
        email: req.params.email,
        deleted: false,
      });
      if (!user) {
        return res.error('User with eamil not found', 404);
      }

      user.deleted = true;
      await user.save();

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * update user status
   */
  static async updateStatus(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const user = await User.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!user) {
        return res.error('User with id not found');
      }

      // update the status of the user
      user.status = req.body.status.toLowerCase();
      await user.save();

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async _sendChangePasswordNotification(user, password) {
    await EmailController.processEmail(
      'Password Reset',
      'change-password',
      {
        name: `${user.first_name} ${user.last_name}`,
        password,
      },
      [user.email],
    );
  }

  /**
   * change user's password
   */
  static async changePassword(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const user = await User.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!user) {
        return res.error('User with id not found', 404);
      }

      user.password = req.body.password;
      await user.save();

      await UserController._sendChangePasswordNotification(user, req.body.password);

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }
}
