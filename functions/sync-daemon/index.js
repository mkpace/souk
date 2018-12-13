import mongoose from 'mongoose';
import Promise from 'bluebird';

import SmmController from '../common/utils/smm';
import logger from '../common/utils/logger';
import { SyncHistory } from './models/sync.history.model';
import { User } from '../user/models/user.model';
import CustomerImport from '../../seeds/customer/helper/customer.import';

const connectMongo = async () => {
  const smmConfig = await SmmController.getParameterFromSystemManager(process.env.ENVIRONMENT);
  try {
    await mongoose.connect(
      smmConfig.MONGO_URI,
      {
        useNewUrlParser: true,
        socketTimeoutMS: 0,
        keepAlive: true,
        reconnectTries: Number.MAX_VALUE,
      },
    );
    logger.info('Mongo DB Connected');
  } catch (err) {
    throw err;
  }
};

const importCustomer = async () => {
  await connectMongo();
  const customerImport = new CustomerImport();
  const USER_ROLES = customerImport.woocommerce.getUserRoles();
  const fetchingRoles = Object.keys(USER_ROLES);
  let customers = {};

  const syncHistories = [];

  await Promise.map(
    fetchingRoles,
    async (role) => {
      logger.info(`Fetching role - ${role}`);
      const task = `sync-customer-${role}`;
      const lastRunData = await SyncHistory.find({ task })
        .sort('-date')
        .limit(1);
      const offset = (lastRunData[0] && +lastRunData[0].result) || 0;
      logger.info(`Fetch from offset - ${offset}`);
      try {
        const users = await customerImport.loadCustomersFromWoocommerce({
          role,
          offset,
          saveToJSON: false,
        });
        if (users.length) {
          syncHistories.push({
            task,
            last_run_time: new Date(),
            result: offset + users.length,
          });
        }
        customers[USER_ROLES[role]] = users;
      } catch (err) {
        logger.info('Failed to fetch users', err);
        throw err;
      }
    },
    { concurrency: 1 },
  );

  await Promise.map(
    syncHistories,
    async (syncHistory) => {
      await SyncHistory.create(syncHistory);
      logger.info(`Sync History record created ( ${syncHistory.task} )`);
    },
    { concurrency: 1 },
  );

  logger.info(`New User Count: ${customers.all.length}`);
  await Promise.map(
    customers.all,
    async (customer) => {
      try {
        await customerImport._addUser({ customer });
      } catch (err) {
        logger.error(err);
      }
    },
    { concurrency: 1 },
  );

  customers.all = [];
  customers = customerImport.mergeRoles(customers);
  logger.info(`New Role Mappings: ${customers.length}`);

  await Promise.map(
    customers,
    async (customer) => {
      try {
        const user = await User.findOne({ email: customer.email });
        if (user) {
          let userStatus = 'approved';
          if (
            customer.role.includes('wwlc_unapproved')
            || customer.role.includes('wwlc_unmoderated')
          ) {
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
          if (user.role !== userRole || user.status !== userStatus) {
            user.role = userRole;
            user.status = userStatus;
            await user.save();
            logger.info(`User status changed for ${user.email}`);
          } else {
            await customerImport._mapUserToCustomer(user, customer);
          }
        } else {
          logger.info(`User not found for ${customer.email}`);
        }
      } catch (err) {
        logger.error(`Failed to import ${customer.email}`);
      }
    },
    { concurrency: 1 },
  );

  mongoose.disconnect();
};

export { importCustomer }; // eslint-disable-line
