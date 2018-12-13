import express from 'express';
import passport from 'passport';
import serverless from 'serverless-http';

import isAllowed from '../common/config/auth/policies/auth.policy';
import route from './routes/order.route';

const app = express();
require('../common/config')(app);

app.use('/order', passport.authenticate('jwt', { session: false }), isAllowed, route);

export default serverless(app);
