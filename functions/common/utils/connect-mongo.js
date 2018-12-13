import mongoose from 'mongoose';

import logger from './logger';

mongoose.Promise = global.Promise;

export default async (mongoUri) => {
  try {
    logger.info('Connecting to mongo...');

    await new Promise((resolve, reject) => {
      mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        socketTimeoutMS: 0,
        keepAlive: true,
        reconnectTries: Number.MAX_VALUE,
      })
        .then(() => {
          resolve();
        })
        .catch(err => reject(err));
    });

    logger.info('Connected to mongo...');

    return mongoose.connection;
  } catch (err) {
    logger.error('Failed to connect to mongo.');
    throw err;
  }
};
