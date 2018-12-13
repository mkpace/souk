import express from 'express';
import serverless from 'serverless-http';

import route from './routes/coupon.route';

const app = express();
require('../common/config')(app);

app.use('/coupon', route);

export default serverless(app);
