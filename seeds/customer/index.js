import path from 'path';
import mongoose from 'mongoose';
import yenv from 'yenv'; // eslint-disable-line import/no-extraneous-dependencies

import SmmController from '../../functions/common/utils/smm';
import CustomerImport from './helper/customer.import';

// load env.yml
const projectEnv = yenv(path.resolve(__dirname, '../../env.yml'), { env: 'test' });

(async () => {
  const customerImport = new CustomerImport();
  /**
   * Specify region directly.
   * AWS-SDK does not load region from config file
   */
  process.env.AWS_REGION = 'us-west-2';

  const smmConfig = await SmmController.getParameterFromSystemManager(projectEnv.ENVIRONMENT);
  try {
    await mongoose.connect(
      smmConfig.MONGO_URI,
      {
        useCreateIndex: true,
        useNewUrlParser: true,
      },
    );

    console.log('Mongo Connected'); // eslint-disable-line no-console

    // const lastPage = customerImport.getLastFetchedCustomerPage();
    // await customerImport.loadCustomersFromWoocommerce({ role: 'all' }); // 1099
    // await customerImport.loadCustomersFromWoocommerce({ role: 'wholesale' }); // 1099
    // await customerImport.loadCustomersFromWoocommerce({ role: 'affiliate' }); // 24
    // await customerImport.loadCustomersFromWoocommerce({ role: 'discount' }); // 14998
    // await customerImport.loadCustomersFromWoocommerce({ role: 'discount_rejected' }); // 117
    // await customerImport.loadCustomersFromWoocommerce({ role: 'employee' }); // 35
    // await customerImport.loadCustomersFromWoocommerce({ role: 'lifetime_giveaway' }); // 1
    // await customerImport.loadCustomersFromWoocommerce({ role: 'by_brad' }); // 24
    // await customerImport.loadCustomersFromWoocommerce({ role: 'by_david' }); // 315
    // await customerImport.loadCustomersFromWoocommerce({ role: 'rejected' }); // 34
    // await customerImport.loadCustomersFromWoocommerce({ role: 'sales_rep' }); // 1
    // await customerImport.loadCustomersFromWoocommerce({ role: 'subscriber' }); // 34
    // await customerImport.loadCustomersFromWoocommerce({ role: 'unapproved' }); // 317
    // await customerImport.loadCustomersFromWoocommerce({ role: 'unmoderated' }); // 317
    // await customerImport.loadCustomersFromWoocommerce({ role: 'administrator' }); // 30

    const users = await customerImport.loadAllCustomersFromJSON();
    customerImport.mergeRoles(users, true);
    // // await CustomerImport.cleanUsers(true);
    // // CustomerImport.customCheck();
    console.log(await customerImport.saveCustomersToDb(0)); // eslint-disable-line

    mongoose.disconnect();
  } catch (err) {
    throw err;
  }
})();
