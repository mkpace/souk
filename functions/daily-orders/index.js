import express from 'express';
import serverless from 'serverless-http';

import route from './routes/daily-orders.route';

const app = express();
require('../common/config')(app);

app.use('/daily-orders', route);

export default serverless(app);
