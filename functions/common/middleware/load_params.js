import SmmController from '../utils/smm';

global.env = null;

module.exports = async (req, res, next) => {
  if (global.env) {
    return next();
  }

  try {
    global.env = await SmmController.getParameterFromSystemManager(process.env.ENVIRONMENT);
    next();
  } catch (err) {
    res.error(err.message);
  }
};
