import path from 'path';
import mongoose from 'mongoose';
import yenv from 'yenv'; // eslint-disable-line

import SmmController from '../../functions/common/utils/smm';
import CountryImport from './helper/country.import';

// load env.yml
const projectEnv = yenv(path.resolve(__dirname, '../../env.yml'), { env: 'dev' });

(async () => {
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

    await CountryImport.saveCountriesToDb();

    mongoose.disconnect();
  } catch (err) {
    throw err;
  }
})();
