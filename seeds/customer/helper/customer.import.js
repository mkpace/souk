import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import Promise from 'bluebird'; // eslint-disable-line

import logger from '../../../functions/common/utils/logger';
import { Customer } from '../../../functions/customer/models/customer.model';
import { User } from '../../../functions/user/models/user.model';
import { SyncHistory } from '../../../functions/sync-daemon/models/sync.history.model';

import WooCommerce from '../../lib/woocommerce';

const config = require('../../config/env');

export default class CustomerImport {
  constructor() {
    this.woocommerce = new WooCommerce(config.woocommerce);
  }

  async loadCustomersFromWoocommerce({ role, saveToJSON, offset }) {
    try {
      const users = await this.woocommerce.getCustomers({ role, saveToJSON, offset });
      return users;
    } catch (err) {
      throw err;
    }
  }

  async loadAllCustomersFromJSON() {
    const USER_ROLES = this.woocommerce.getUserRoles();
    const customers = {};
    await Promise.map(
      _.keys(USER_ROLES),
      async (roleKey) => {
        const users = JSON.parse(
          fs.readFileSync(path.resolve(__dirname, `../data/${roleKey}s.json`)),
        );
        await SyncHistory.create({
          task: `sync-customer-${roleKey}`,
          last_run_time: new Date(),
          result: users.length,
        });
        customers[USER_ROLES[roleKey]] = users;
      },
      { concurrency: 1 },
    );
    return customers;
  }

  mergeRoles(users, saveToJSON) {
    const USER_ROLES = this.woocommerce.getUserRoles();
    const customers = {};
    _.forEach(USER_ROLES, (role) => {
      // const users = JSON.parse(
      //   fs.readFileSync(path.resolve(__dirname, `../data/${roleKey}s.json`)),
      // );
      if (users[role]) {
        _.forEach(users[role], (user) => {
          // eslint-disable-line no-shadow
          const { id } = user;
          if (customers[id]) {
            const customerRole = customers[id].role;
            customers[id].role = customerRole.includes(role)
              ? customerRole
              : [...customerRole, role];
          } else {
            customers[id] = user;
            customers[id].role = role === customers[id].role ? [role] : [role, customers[id].role];
          }
        });
      }
    });
    if (saveToJSON) {
      fs.writeFileSync(
        path.resolve(__dirname, '../data/role-mapping.json'),
        JSON.stringify(_.values(customers)),
        'utf8',
      );
    }
    return _.values(customers);
  }

  static customCheck() {
    const users = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/all.json')));
    _.forEach(users, (user) => {
      if (user.role.includes('wholesale_customer2') && user.role.includes('discount')) {
        logger.info(user.role); // eslint-disable-line no-console
      }
    });
  }

  static async cleanUsers(keepStuff = true) {
    const result = await User.updateMany(
      { ...(keepStuff ? { email: { $not: /@souk.com$/ } } : {}) },
      { $set: { deleted: true } },
    );
    logger.info(`Deleted ${result.nModified} users`);

    const customers = await Customer.find({ deleted: false }).populate('user');
    return Promise.map(
      customers,
      async (customer) => {
        if (!customer.user || customer.user.deleted) {
          customer.deleted = true; // eslint-disable-line
          await customer.save();
          logger.info(`Removed customer (${customer._id})`);
        }
      },
      { concurrency: 1 },
    );
  }

  saveCustomersToDb(startIndex) {
    logger.info(`Saving customers to db, starting from index ${startIndex}`);

    const self = this;

    const raw = fs.readFileSync(path.resolve(__dirname, '../data/role-mapping.json'));
    self.customers = JSON.parse(raw);

    // logger.info(self.customers.length);

    const failCustomer = [];

    return Promise.map(
      self.customers.slice(startIndex),
      async (customer) => {
        /**
         * Don't import souk holders.
         * To avoid duplication on db as we don't remove existing
         * souk stuff
         */
        try {
          // if (!customer.email.toLowerCase().includes('@souk.com')) {
          await self._addCustomer(customer);
          // }
        } catch (error) {
          failCustomer.push({ email: customer.email });
        }
      },
      { concurrency: 1 },
    ).then(() => failCustomer);
  }

  async _addCustomer(customer) {
    this.funcName = '_addCustomer';

    try {
      let userStatus = 'approved';
      if (customer.role.includes('wwlc_unapproved') || customer.role.includes('wwlc_unmoderated')) {
        userStatus = 'pending';
      } else if (customer.role.includes('wwlc_rejected')) {
        userStatus = 'suspended';
      }

      let userRole = 'customer';
      if (customer.role.includes('employee')) {
        userRole = 'editor';
      } else if (customer.role.includes('administrator')) {
        userRole = 'administrator';
      }

      const user = await this._addUser({ customer, role: userRole, status: userStatus });
      await this._mapUserToCustomer(user, customer);
    } catch (err) {
      throw err;
    }
  }

  async _addUser({ customer, role = 'customer', status = 'approved' }) {
    this.funcName = '_addUser';
    const userInfo = {
      first_name: customer.first_name,
      last_name: customer.last_name,
      username: customer.username,
      email: customer.email.toLowerCase(),
      password: 'password',
      roles: [role],
      status,
      dt_created: customer.date_created,
      dt_updated: customer.date_modified,
      image: {
        src: customer.avatar_url,
        alt: 'avatar',
      },
    };
    const user = await User.create(userInfo);
    logger.info(`User created for ${user.email}`);
    return user;
  }

  async _mapUserToCustomer(user, customer) {
    this.funcName = '_mapUserToCustomer';

    if (user.status === 'approved') {
      const shippingPhone = _.find(customer.meta_data, { key: 'shipping_phone' });
      let customerInfo = {
        id: customer.id,
        dt_registered: customer.date_created,
        dt_updated: customer.date_modified,
        dt_last_active: new Date(),
        dt_approved: new Date(),
        subscribe: customer.role.includes('subscriber'),
        billing: {
          first_name: customer.billing.first_name,
          last_name: customer.billing.last_name,
          company: customer.billing.company,
          address_1: customer.billing.address_1,
          address_2: customer.billing.address_2,
          city: customer.billing.city,
          postal_code: customer.billing.postcode,
          country: customer.billing.country,
          state: customer.billing.state,
          phone: customer.billing.phone,
          email: customer.billing.email,
        },
        shipping: {
          first_name: customer.shipping.first_name,
          last_name: customer.shipping.last_name,
          company: customer.shipping.company,
          address_1: customer.shipping.address_1,
          address_2: customer.shipping.address_2,
          city: customer.shipping.city,
          postal_code: customer.shipping.postcode,
          country: customer.shipping.country,
          state: customer.shipping.state,
          phone: shippingPhone ? shippingPhone.value : '',
        },
      };

      if (customer.role.includes('wholesale_customer2')) {
        const wwlcCompanyName = _.find(customer.meta_data, { key: 'wwlc_company_name' });
        const wwlcWebsite = _.find(customer.meta_data, { key: 'wwlc_cf_wholesalewebsite' });
        const wwlcReferredBy = _.find(customer.meta_data, { key: 'wwlc_cf_referredbycheckbox' });
        customerInfo = _.assign(customerInfo, {
          type: 'wholesale',
          company: wwlcCompanyName ? wwlcCompanyName.value : '',
          website: wwlcWebsite ? wwlcWebsite.value : '',
          referredby:
            wwlcReferredBy && wwlcReferredBy.value.length > 0 ? wwlcReferredBy.value[0] : '',
        });
      } else if (customer.role.includes('discount')) {
        customerInfo.type = 'discount';
      } else if (customer.role.includes('affiliate')) {
        customerInfo.type = 'affiliate';
      } else {
        customerInfo.type = 'retail';
      }

      customerInfo.user = user._id;
      await Customer.create(customerInfo);

      logger.info(`User ${user.email} saved as cusomter - ${customerInfo.type}`);
    }
  }

  async _mapStuffToCustomer() {
    logger.info('Mapping souk email holders to customers');

    const self = this;

    const raw = fs.readFileSync(path.resolve(__dirname, '../data/role-mapping.json'));
    self.customers = JSON.parse(raw);

    const soukCustomers = self.customers.filter(customer => customer.email.toLowerCase().includes('@souk.com'));

    await Promise.map(
      soukCustomers,
      async (stuff) => {
        const userDoc = await User.findOne({ email: stuff.email.toLowerCase() });
        await this._mapUserToCustomer(userDoc, stuff);
      },
      { concurrency: 1 },
    );
  }
}
