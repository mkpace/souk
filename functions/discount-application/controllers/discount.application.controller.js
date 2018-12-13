import _ from 'lodash';

import { DiscountApplication } from '../models/discount.application.model';
import uploadToS3 from '../../common/utils/upload';

export default class DiscountApplicationController {
  /**
   * returns the list of all discount applications
   */
  static async list(req, res) {
    try {
      const applications = await DiscountApplication
        .find({ deleted: false })
        .populate('user_id')
        .populate('modified_by')
        .populate('approved_by');

      return res.success(applications);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * get a specific discount application
   */
  static async getOne(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const application = await DiscountApplication.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!application) {
        return res.error('Item with id not found', 404);
      }

      await DiscountApplication.populate(application, { path: 'user_id' });
      await DiscountApplication.populate(application, { path: 'modified_by' });
      await DiscountApplication.populate(application, { path: 'approved_by' });

      return res.success(application);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * update a discount application
   */
  static async update(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const application = await DiscountApplication.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!application) {
        return res.error('Item with id not found');
      }

      delete req.body._id; // eslint-disable-line no-underscore-dangle
      const updated = _.assign(application, req.body);
      await updated.save();
      await DiscountApplication.populate(updated, { path: 'user_id' });
      await DiscountApplication.populate(updated, { path: 'modified_by' });
      await DiscountApplication.populate(updated, { path: 'approved_by' });

      return res.success(updated);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * soft delete a discount application
   */
  static async destroy(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const application = await DiscountApplication.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!application) {
        return res.error('Item with eamil not found', 404);
      }

      application.deleted = true;
      await application.save();

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * create a new discount application
   */
  static async create(req, res) {
    if (!req.params.user_id) {
      return res.error('Invalid user id supplied');
    }

    try {
      const application = await DiscountApplication.create(
        _.assign(
          req.body,
          { user_id: req.params.user_id },
        ),
      );
      await DiscountApplication.populate(application, { path: 'user_id' });
      await DiscountApplication.populate(application, { path: 'modified_by' });
      await DiscountApplication.populate(application, { path: 'approved_by' });

      return res.success(application);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * approve a discount application
   */
  static async approve(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const application = await DiscountApplication.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!application) {
        return res.error('Item with id not found');
      }

      application.status = 'approved';
      await application.save();
      await DiscountApplication.populate(application, { path: 'user_id' });
      await DiscountApplication.populate(application, { path: 'modified_by' });
      await DiscountApplication.populate(application, { path: 'approved_by' });

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * upload document to S3
   * document included a request body as a base64 encoded string
   */
  static async uploadDocument(req, res) {
    try {
      const filePath = await uploadToS3(req.body.document, 'discount_applications');

      return res.success(filePath);
    } catch (err) {
      return res.error(err.message);
    }
  }
}
