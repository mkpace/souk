import mongoose from 'mongoose';

import CartSweeperController from './controllers/cart.sweeper.controller';
import SmmController from '../common/utils/smm';
import connectMongo from '../common/utils/connect-mongo';

mongoose.Promise = global.Promise;

export default async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false; // eslint-disable-line no-param-reassign

  try {
    const smmConfig = await SmmController.getParameterFromSystemManager(process.env.ENVIRONMENT);
    await connectMongo(smmConfig.MONGO_URI);
    await CartSweeperController.sweep(); // sweep time-elapsed carts
    mongoose.disconnect();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'success' }),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: err.message }),
    };
  }
};
