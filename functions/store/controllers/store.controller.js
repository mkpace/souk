import _ from 'lodash';

import { Store } from '../models/store.model';

export default class StoreController {
  static async list(req, res) {
    try {
      const stores = await Store.find({ deleted: false });

      return res.success(stores);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async create(req, res) {
    try {
      const store = await Store.create(req.body);

      return res.success(store);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async update(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const store = await Store.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!store) {
        return res.error('Store with id not found', 404);
      }

      delete req.body._id; // eslint-disable-line no-underscore-dangle
      const updated = _.assign(store, req.body);
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
      const store = await Store.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!store) {
        return res.error('Store with id not found', 404);
      }

      store.deleted = true;
      await store.save();

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }
}
