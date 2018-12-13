import express from 'express';
import serverless from 'serverless-http';

import route from './routes/discount.application.route';

const app = express();
require('../common/config')(app);

app.use('/discount-application', route);

export default serverless(app);
