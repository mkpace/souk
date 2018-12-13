import AWS from 'aws-sdk';
import yaml from 'js-yaml';

import logger from './logger';

/**
 * references
 * https://gist.github.com/kellydavid/1011c170576dafd6cc9433ee8309fef1
 */
export default class SmmController {
  static async getParameterFromSystemManager(name) {
    const ssm = new AWS.SSM();
    const params = {
      Name: name,
      WithDecryption: true,
    };

    try {
      const res = await new Promise((resolve, reject) => {
        ssm.getParameter(params, (err, data) => {
          if (err) {
            reject(err);
          }

          resolve(data);
        });
      });

      const env = yaml.safeLoad(res.Parameter.Value);
      return env;
    } catch (err) {
      logger.error(`Failed to load environment params from SMM. Error: ${err.message}`);
      throw err;
    }
  }
}
