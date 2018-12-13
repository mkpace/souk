import _ from 'lodash';

import { Country } from '../models/country.model';

export default class CountryController {
  static async list(req, res) {
    try {
      const countries = await Country
        .find({ deleted: false });

      return res.success(countries);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async create(req, res) {
    try {
      const country = await Country.create(req.body);

      return res.success(country);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async update(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const country = await Country.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!country) {
        return res.error('Item with id not found', 404);
      }

      delete req.body._id; // eslint-disable-line no-underscore-dangle
      const updated = _.assign(country, req.body);
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
      const country = await Country.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!country) {
        return res.error('Country with id not found', 404);
      }

      country.deleted = true;
      await country.save();

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }
}
