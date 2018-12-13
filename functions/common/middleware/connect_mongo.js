import mongoose from 'mongoose';

import connectMongo from '../utils/connect-mongo';
import logger from '../utils/logger';

let cacheDb = null;
mongoose.Promise = global.Promise;

module.exports = async (req, res, next) => {
  if (cacheDb && mongoose.connection.readyState === 1) {
    logger.info('Use existing mongo connection.');
    return next();
  }

  try {
    cacheDb = await connectMongo(global.env.MONGO_URI);
    next();
  } catch (err) {
    res.error(err.message);
  }
};
