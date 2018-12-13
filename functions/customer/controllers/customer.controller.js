import _ from 'lodash';
import { parse } from 'json2csv';

import { Customer } from '../models/customer.model';
import { POPULATE_FIELDS, User } from '../../user/models/user.model';
import uploadToS3 from '../../common/utils/upload';
import EmailController from '../../email/controllers/email.controller';

export default class CustomerController {
  /**
   * Return an array of all customers
   * Customers are both Retail and Wholesale.
   * Wholesale customers can be managed by sales person
   * and are specifically approved accounts in the system.
   */
  static async list(req, res) {
    try {
      const filter = { deleted: false };
      let sort = 'dt_created';

      if (req.query.sort) {
        ({ sort } = req.query);
      }
      if (req.query.type) { // eg. wholesale, retail
        filter.type = { $in: req.query.type.toLowerCase().split(',') };
      }
      if (req.query.q) {
        const keyword = new RegExp(req.query.q, 'i');
        filter.$or = [
          { company: { $regex: keyword } },
          { website: { $regex: keyword } },
          { 'billing.first_name': { $regex: keyword } },
          { 'billing.last_name': { $regex: keyword } },
          { 'billing.company': { $regex: keyword } },
          { 'billing.city': { $regex: keyword } },
          { 'billing.state': { $regex: keyword } },
          { 'billing.email': { $regex: keyword } },
        ];
      }

      // calculate total numbers
      const total = await Customer
        .countDocuments(filter);

      // pagination configuration
      const pageOptions = {
        page: parseInt(req.query.page || 0, 10),
        count: parseInt(req.query.count, 10) === -1 ? total : parseInt(req.query.count || 10, 10),
      };

      const customers = await Customer
        .find(filter)
        .sort(sort)
        .skip(pageOptions.page * pageOptions.count)
        .limit(pageOptions.count)
        .populate('user', POPULATE_FIELDS)
        .populate('approved_by', POPULATE_FIELDS)
        .exec();

      return res.success({
        total,
        page: pageOptions.page,
        count: pageOptions.count,
        customers,
      });
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async _sendRegSuccessNotification(type = 'retail', email, firstName) {
    if (type === 'retail') { // eslint-disable-line
    } else if (type === 'wholesale') {
      await EmailController.processEmail(
        'Wholesale Customer Registration',
        'wholesale-register',
        {
          first_name: firstName,
        },
        [email],
      );
    }
  }

  /**
   * Add a new customer
   */
  static async create(req, res) {
    let isUserCreated = false;

    try {
      if (req.body.user && typeof req.body.user === 'object') {
        // adjust user status based on customer type
        if (req.body.type === 'retail') {
          req.body.user.status = 'approved';
        } else {
          req.body.user.status = 'pending';
        }

        const user = await User.create(req.body.user);
        req.body.user = user._id;
        isUserCreated = true;
      }

      const customer = await Customer.create(req.body);
      await Customer.populate(customer, { path: 'user', select: POPULATE_FIELDS });
      await Customer.populate(customer, { path: 'approved_by', select: POPULATE_FIELDS });
      await CustomerController._sendRegSuccessNotification(
        customer.type,
        customer.user.email,
        customer.user.first_name,
      );

      return res.success(customer);
    } catch (err) {
      if (isUserCreated) {
        await User.deleteOne({ _id: req.body.user });
      }

      return res.error(err.message);
    }
  }

  /**
   * Get a specific customer by id
   */
  static async customerById(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const customer = await Customer.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!customer) {
        return res.error('Item with id not found', 404);
      }

      await Customer.populate(customer, { path: 'user', select: POPULATE_FIELDS });
      await Customer.populate(customer, { path: 'approved_by', select: POPULATE_FIELDS });

      return res.success(customer);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * Update a customer
   */
  static async update(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const customer = await Customer.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!customer) {
        return res.error('Item with id not found');
      }

      // update referred user
      if (req.body.user && typeof req.body.user === 'object') {
        if (customer.user) {
          // update existing user
          const user = await User.findOne({ _id: customer.user });
          if (!user) {
            return res.error('Item with id not found');
          }

          delete req.body.user.passwordHash;
          const updateUser = _.assign(user, req.body.user);
          await updateUser.save();

          delete req.body.user;
        } else {
          // create a new user
          const user = await User.create(req.body.user);
          req.body.user = user._id;
        }
      }

      // update the customer
      delete req.body._id; // eslint-disable-line no-underscore-dangle
      const updatedCust = _.assign(customer, req.body);
      await updatedCust.save();
      await Customer.populate(updatedCust, { path: 'user', select: POPULATE_FIELDS });
      await Customer.populate(customer, { path: 'approved_by', select: POPULATE_FIELDS });

      return res.success(updatedCust);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async destroy(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      // soft-delete customer
      const customer = await Customer.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!customer) {
        return res.error('Item with id not found', 404);
      }

      customer.deleted = true;
      await customer.save();

      // soft-delete user
      const user = await User.findOne({
        _id: customer.user,
        deleted: false,
      });
      if (!user) {
        return res.error('Item with id not found', 404);
      }

      user.deleted = true;
      await user.save();

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * Upload attachment to S3
   */
  static async uploadAttachment(req, res) {
    try {
      const filePath = await uploadToS3(req.body.attachment, 'customer-attachments');

      return res.success(filePath);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * format for csv
   */
  static _transformToCsv(customers) {
    const jsonDocs = [];
    _.map(customers, (customer) => {
      if (!customer.user) {
        return;
      }

      jsonDocs.push({
        first_name: customer.user.first_name,
        last_name: customer.user.last_name,
        dt_created: customer.dt_created,
        dt_updated: customer.dt_updated,
        username: customer.user.username,
        role: customer.type,
        email: customer.user.email,
        billing_address_1: customer.billing.address_1,
        billing_address_2: customer.billing.address_2,
        billing_city: customer.billing.city,
        billing_state: customer.billing.state,
        billing_zip: customer.billing.postal_code,
        shipping_address_1: customer.shipping.address_1,
        shipping_address_2: customer.shipping.address_2,
        shipping_city: customer.shipping.city,
        shipping_state: customer.shipping.state,
        shipping_zip: customer.shipping.postal_code,
      });
    });

    const csv = parse(
      jsonDocs,
      {
        fields: [
          { label: 'First Name', value: 'first_name', default: '' },
          { label: 'Last Name', value: 'last_name', default: '' },
          { label: 'Dt Created', value: 'dt_created', default: '' },
          { label: 'Dt Modified', value: 'dt_updated', default: '' },
          { label: 'User Name', value: 'username', default: '' },
          { label: 'Role', value: 'role', default: '' },
          { label: 'Email', value: 'email', default: '' },
          { label: 'Billing Address 1', value: 'billing_address_1', default: '' },
          { label: 'Billing Address 2', value: 'billing_address_2', default: '' },
          { label: 'Billing City', value: 'billing_city', default: '' },
          { label: 'Billing State', value: 'billing_state', default: '' },
          { label: 'Billing Zip', value: 'billing_zip', default: '' },
          { label: 'Shipping Address 1', value: 'shipping_address_1', default: '' },
          { label: 'Shipping Address 2', value: 'shipping_address_2', default: '' },
          { label: 'Shipping City', value: 'shipping_city', default: '' },
          { label: 'Shipping State', value: 'shipping_state', default: '' },
          { label: 'Shipping Zip', value: 'shipping_zip', default: '' },
        ],
      },
    );

    return csv;
  }

  static async export(req, res) {
    try {
      const filter = { deleted: false };
      if (req.query.type) {
        filter.type = req.query.type.toLowerCase();
      }

      const customers = await Customer
        .find(filter)
        .populate('user', POPULATE_FIELDS)
        .exec();

      const csvFileName = `${filter.type}-customers-${new Date().getTime()}.csv`;
      const csv = CustomerController._transformToCsv(customers);

      // send csv data stream
      res.setHeader('Content-disposition', `attachment; filename=${csvFileName}`);
      res.set('Content-Type', 'text/csv');
      return res.status(200).send(csv);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async stat(req, res) {
    try {
      let activeCnt = 0;

      // 'retail', 'wholesale', 'wholesale-rep', 'discount', 'affiliate'
      const retailCnt = await Customer
        .countDocuments({
          deleted: false,
          type: 'retail',
        });
      activeCnt += retailCnt;

      const wholesaleCnt = await Customer
        .countDocuments({
          deleted: false,
          type: 'wholesale',
        });
      activeCnt += wholesaleCnt;

      const wholesaleRepCnt = await Customer
        .countDocuments({
          deleted: false,
          type: 'wholesale-rep',
        });
      activeCnt += wholesaleRepCnt;

      const discountCnt = await Customer
        .countDocuments({
          deleted: false,
          type: 'discount',
        });
      activeCnt += discountCnt;

      const affiliateCnt = await Customer
        .countDocuments({
          deleted: false,
          type: 'affiliate',
        });
      activeCnt += affiliateCnt;

      return res.success({
        active: activeCnt,
        retail: retailCnt,
        wholesale: wholesaleCnt,
        wholesaleRep: wholesaleRepCnt,
        discount: discountCnt,
        affiliate: affiliateCnt,
      });
    } catch (err) {
      return res.error(err.message);
    }
  }
}
