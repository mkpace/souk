import _ from 'lodash';

import { Setting } from '../models/setting.model';

export default class SettingController {
  static async list(req, res) {
    try {
      const settings = await Setting
        .find({ deleted: false });

      return res.success(settings);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async create(req, res) {
    try {
      const setting = await Setting.create(req.body);

      return res.success(setting);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async update(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const setting = await Setting.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!setting) {
        return res.error('Setting with id not found', 404);
      }

      delete req.body._id; // eslint-disable-line no-underscore-dangle
      const updated = _.assign(setting, req.body);
      await updated.save();

      return res.success(updated);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async destroy(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const setting = await Setting.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!setting) {
        return res.error('Setting with id not found', 404);
      }

      setting.deleted = true;
      await setting.save();

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async getSetting(key) {
    try {
      const setting = await Setting.findOne({
        key,
        deleted: false,
      });
      if (!setting) {
        throw new Error('Setting not found.');
      }

      return setting;
    } catch (err) {
      throw err;
    }
  }
}
