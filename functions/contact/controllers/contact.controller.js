import _ from 'lodash';

import { Contact } from '../models/contact.model';
import EmailController from '../../email/controllers/email.controller';

export default class ContactController {
  /**
   * returns the list of all contacts
   */
  static async list(req, res) {
    try {
      const contacts = await Contact
        .find({ deleted: false });

      return res.success(contacts);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * get a specific contact
   */
  static async getOne(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const contact = await Contact.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!contact) {
        return res.error('Item with id not found', 404);
      }

      return res.success(contact);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * update a contact
   */
  static async update(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const contact = await Contact.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!contact) {
        return res.error('Item with id not found');
      }

      delete req.body._id; // eslint-disable-line no-underscore-dangle
      const updated = _.assign(contact, req.body);
      await updated.save();

      return res.success(updated);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * soft delete a contact item
   */
  static async destroy(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const contact = await Contact.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!contact) {
        return res.error('Item with id not found', 404);
      }

      contact.deleted = true;
      await contact.save();

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * send email notification to customer and souk admin for successful contact request
   */
  static async _sendContactSubmissionNotification(contact) {
    try {
      // send submission notification to client
      await EmailController.processEmail(
        'Your contact request submitted successfully',
        'contact-request-submitted',
        {
          first_name: contact.first_name,
          last_name: contact.last_name,
        },
        [contact.email],
      );

      // send receive notification to admin
      await EmailController.processEmail(
        'New contact request received',
        'contact-request-received',
        {
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          phone: contact.phone,
          subject: contact.subject,
          message: contact.message,
        },
        [global.env.FROM_EMAIL],
      );
    } catch (err) {
      throw err;
    }
  }

  /**
   * create a new contact entry
   */
  static async create(req, res) {
    try {
      const contact = await Contact.create(req.body);
      await ContactController._sendContactSubmissionNotification(contact);

      return res.success(contact);
    } catch (err) {
      return res.error(err.message);
    }
  }
}
