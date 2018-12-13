import _ from 'lodash';

import uploadToS3 from '../../common/utils/upload';
import { EmailTemplate } from '../models/email.template.model';

export default class EmailTemplateController {
  static async list(req, res) {
    try {
      const templates = await EmailTemplate
        .find({ deleted: false });

      return res.success(templates);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async create(req, res) {
    try {
      const template = await EmailTemplate.create(req.body);

      return res.success(template);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async update(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const template = await EmailTemplate.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!template) {
        return res.error('Item with id not found', 404);
      }

      delete req.body._id; // eslint-disable-line no-underscore-dangle
      const updated = _.assign(template, req.body);
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
      const template = await EmailTemplate.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!template) {
        return res.error('Template with id not found', 404);
      }

      template.deleted = true;
      await template.save();

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * upload attachment to S3
   */
  static async uploadTemplate(req, res) {
    try {
      const filePath = await uploadToS3(req.body.template, 'email-templates');

      return res.success(filePath);
    } catch (err) {
      return res.error(err.message);
    }
  }
}
