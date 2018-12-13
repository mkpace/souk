import express from 'express';
import passport from 'passport';
import serverless from 'serverless-http';

import isAllowed from '../common/config/auth/policies/auth.policy';
import route from './routes/payment.route';

const app = express();
require('../common/config')(app);

app.use('/payment', passport.authenticate('jwt', { session: false }), isAllowed, route);

export default serverless(app);
