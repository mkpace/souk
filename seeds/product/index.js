import path from 'path';
import mongoose from 'mongoose';
import yenv from 'yenv'; // eslint-disable-line import/no-extraneous-dependencies

import SmmController from '../../functions/common/utils/smm';
import ProductImport from './helper/product.import';

// load env.yml
const projectEnv = yenv(path.resolve(__dirname, '../../env.yml'), { env: 'test' });

(async () => {
  const productImport = new ProductImport();

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

    // await productImport._generateProductJSONFromWoocommerce();
    // await productImport.process();
    await ProductImport.importFromJSON();
    await productImport.importReviews();
    mongoose.disconnect();
  } catch (err) {
    throw err;
  }
})();
